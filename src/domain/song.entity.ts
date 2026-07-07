import { DateTime } from 'luxon';
import type { SongSession } from '../model/session.model';
import type { SongParams } from '../model/settings.model';
import type { Genre, UserSong } from '../model/song.model';
import type { Status, StatusMode, TrainingFocus } from '../model/app.types';
import { refData } from '../service/base/app-cache.setup';
import { type DateLike, toDate } from '../utils/date.helper';
import { defineMethods } from '../utils/object.helper';

// Controls the logarithmic soft-cap curve for mastery exceeding the target.
// Higher values mean faster diminishing returns beyond the target.
// At FACTOR=1: raw=2×target → area score ≈ 1.0 + ln(2)/ln(target+1)
const MASTERY_SOFT_CAP_LOG_FACTOR = 1;

const MASTERY_WEIGHT_FOUNDATION = 0.4;
const MASTERY_WEIGHT_EXECUTION  = 0.4;
const MASTERY_WEIGHT_MATURITY   = 0.2;

// Progress thresholds for initial focus suggestion.
const PROGRESS_EARLY_STAGE = 40;
const PROGRESS_MID_STAGE   = 80;

// ---------------------------------------------------------------------------
// Focus area groupings
// ---------------------------------------------------------------------------

const FOUNDATION_AREAS: TrainingFocus[] = ['melody', 'harmony', 'rhythm'];
const EXECUTION_AREAS:  TrainingFocus[] = ['technique', 'form', 'expression'];
const MATURITY_AREAS:   TrainingFocus[] = ['finishing', 'memorize', 'improv'];
const MASTERY_INTERPOLATION_PRECISION = 32; // target / 2^32 or 6e-8
export const MASTERY_INTERPOLATION_ORDER: TrainingFocus[] = [
    ...FOUNDATION_AREAS,
    ...EXECUTION_AREAS,
    ...MATURITY_AREAS,
];

// Maximum accumulated intensity per focus area across all sessions.
// Raise this constant to require more sessions before progress saturates.
const DEFAULT_MASTERY_TARGETS: Genre['masteryTargets'] = {
    melody:     10,
    rhythm:     10,
    harmony:    10,
    form:       15,
    technique:  25,
    expression: 25,
    memorize:   10,
    improv:     15,
    finishing:  25,
} as const;

const targetsLookup = refData.genres.reduce((acc, genre) => {
    acc[genre.name] = genre.masteryTargets;
    return acc;
}, {} as Record<string, Genre['masteryTargets']>);

export type SongEntity = ReturnType<typeof createSongEntity> & UserSong;

export function createSongEntity(song: UserSong, config: SongParams) {
    const statusMode: StatusMode = song.status || 'auto';
    const getFocusTarget = (focus: TrainingFocus) => 
        song.genre && targetsLookup[song.genre] && targetsLookup[song.genre][focus] || DEFAULT_MASTERY_TARGETS[focus];

    function progressFromMastery(fromPreview?: UserSong['mastery']): number | undefined {
        const mastery = fromPreview ?? song.mastery;
        const normalizeAreaScore = (focus: TrainingFocus): number => {
            const raw = mastery[focus] ?? 0;
            const target = getFocusTarget(focus);
            if (raw < target) {
                return raw / target;
            }
            const excess = raw - target;
            return 1.0 + Math.log(1 + excess * MASTERY_SOFT_CAP_LOG_FACTOR) / Math.log(1 + target);
        };
        const averageScoreOver = (areas: TrainingFocus[]): number => {
            return areas.map(normalizeAreaScore).reduce((sum, score) => sum + score, 0) / areas.length;
        };

        if (mastery && Object.keys(mastery).length) {
            const foundationScore = averageScoreOver(FOUNDATION_AREAS);
            const executionScore  = averageScoreOver(EXECUTION_AREAS);
            const maturityScore   = averageScoreOver(MATURITY_AREAS);

            const weighted =
                MASTERY_WEIGHT_FOUNDATION * foundationScore +
                MASTERY_WEIGHT_EXECUTION  * executionScore  +
                MASTERY_WEIGHT_MATURITY   * maturityScore;

            const score = Math.min(weighted, 1.0);
            return Math.round(score * 100);
        }
    }

    /**
     * Inverts progressFromMastery() for import use cases where only an overall
     * progress % is known. Fills mastery areas sequentially in canonical order,
     * completing each area to its target before starting the next.
     * The last required area may receive a fractional value.
     *
     * @param targetProgress - Estimated progress (0–100) from imported data.
     */
    function masteryFromProgress(progress: number): UserSong['mastery'] {
        function setFractionalValue(area: TrainingFocus, target: number) {
            // Binary search for the fractional value in this area that hits the target.
            let low = 0;
            let high = target;

            for (let i = 0; i < MASTERY_INTERPOLATION_PRECISION; i++) {
                const mid = (low + high) / 2;
                result[area] = mid;
                const probe = progressFromMastery(result) ?? 0;

                if (probe < song.progress) {
                    low = mid;
                } else {
                    high = mid;
                }
            }

            result[area] = (low + high) / 2;
        }

        const result: UserSong['mastery'] = {};
        if (progress > 0) {
            for (const area of MASTERY_INTERPOLATION_ORDER) {
                const target = getFocusTarget(area);
                result[area] = target;

                const achieved = progressFromMastery(result) ?? 0;
                if (achieved >= progress) {
                    setFractionalValue(area, target);
                    break;
                }
            }
        }

        return result;
    }

    /**
     * Computes the raw exponential decay factor based on elapsed time and touch history.
     * 
     * Formula from Ebbinghaus' forgetting curve:  e^(-t / S)
     * where R is retention, t is elapsed time, and S is stability.
     * 
     * Note: Stability uses sqrt instead of log for better UX.
     * @returns a value in [0, 1] where 1 = no decay, 0 = fully forgotten.
     */
    function retentionFactor(changedAt: DateLike, touchCount = 1): number {
        const elapsed = DateTime.now().diff(toDate(changedAt), 'days').days;
        if (elapsed > config.retentionGracePeriodDays) {
            // Propably more realistic but retentionHalfLifeDays not applicable
            // const stability = config.retentionHalfLifeDays * Math.log(1 + touchCount);

            const stability = (config.retentionHalfLifeDays / Math.LN2) * Math.sqrt(touchCount);
            const factor = Math.exp(-elapsed / stability);
            return Math.max(factor, 0);
        }
        return 1.0;
    }
    
    /**
     * Returns the effective progress delta caused by retention decay.
     * Always ≤ 0 — represents how many progress points to subtract from song.progress.
     *
     * The starting point of the decay curve is boosted toward 1.0 based on
     * lastRetention and sessionBoostFactor, so a recently played song never
     * drops immediately to its pre-session retention level.
     * @returns The retention delta.
     */
    function retentionDelta(fromPreview?: Pick<UserSong, 'changedAt' | 'touchCount' | 'lastRetention'>): number {
        const changedAt = fromPreview?.changedAt ?? song.changedAt;
        const touchCount = fromPreview?.touchCount ?? song.touchCount;
        const lastRetention = fromPreview?.lastRetention ?? song.lastRetention ?? 1.0;
        const boostedFactor = lastRetention + config.retentionSessionBoostFactor * (1.0 - lastRetention);
        return Math.round(boostedFactor * retentionFactor(changedAt, touchCount) * 100) - 100;
    }

    function derivedStatus(progress: number): Status {
        const retention = -retentionDelta();
        if (progress > config.progressArchivedThreshold && retention > config.progressRepeatThreshold) {
            if (Math.max(progress - retention, 0) < config.progressArchivedThreshold) {
                return 'archived';
            }
            return 'repeat';
        }
        if (progress > config.progressDoneThreshold) {
            return 'done';
        }
        if (progress > 0) {
            return 'wip';
        }
        return 'todo';
    }

    function resolvedStatus(): Status {
        return statusMode !== 'auto' ? song.status : derivedStatus(song.progress ?? 0);
    }

    function suggestInitialFocus(): TrainingFocus[] {
        if (song.mastery && Object.keys(song.mastery).length > 0) {
            return suggestFromMasteryGaps();
        }
        return suggestFromProgress(song.progress ?? 0);
    }

    function suggestFromMasteryGaps(): TrainingFocus[] {
        const belowTarget = (k: TrainingFocus) => (song.mastery[k] ?? 0) < getFocusTarget(k);
        const allAreas: TrainingFocus[] = [
            ...FOUNDATION_AREAS.filter(belowTarget),
            ...EXECUTION_AREAS.filter(belowTarget),
            ...MATURITY_AREAS,
        ];
        return allAreas.slice(0, config.suggestedMasteryFocusCount);
    }

    function suggestFromProgress(progress: number): TrainingFocus[] {
        if (progress < PROGRESS_EARLY_STAGE) {
            return ['melody', 'harmony', 'rhythm'];
        }
        if (progress < PROGRESS_MID_STAGE) {
            return ['technique', 'expression', 'form'];
        }
        return ['finishing', 'memorize', 'expression'];
    }

    function migrateLegacyProgress(): UserSong | undefined {
        const copy = { ...song };
        if (copy.mastery === undefined || copy.mastery === null) {
            copy.mastery = masteryFromProgress(song.progress);
            copy.touchCount = Object.entries(copy.mastery ?? {}).reduce((acc, [key, value]) => acc + Math.round(value), 0);
            if (copy.fav) {
                copy.touchCount *= 3;
            }
            return copy;
        }
        return undefined;
    }

    return defineMethods(song, {
        statusMode,
        getFocusTarget,
        progressFromMastery,
        masteryFromProgress,
        retentionFactor,
        retentionDelta,
        resolvedStatus,
        migrateLegacyProgress,
        suggestInitialFocus,
        quickSessionFocus(): SongSession['areas'] {
            const delta = config.quickSessionDeltaPerArea;
            return Object.fromEntries(suggestInitialFocus().map((key) => [key, delta]));
        },
    });
}