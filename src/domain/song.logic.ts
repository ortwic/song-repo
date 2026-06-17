import type { SongDiff } from '../model/session.model';
import type { TrainingFocus } from '../model/types';
import type { UserSong } from '../model/song.model';
import { refData } from '../service/base/app-cache.setup';

// Maximum accumulated intensity per focus area across all sessions.
// Raise this constant to require more sessions before progress saturates.
export const DEFAULT_MASTERY_TARGETS: Record<TrainingFocus, number> = {
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

// Controls the logarithmic soft-cap curve for mastery exceeding the target.
// Higher values mean faster diminishing returns beyond the target.
// At FACTOR=1: raw=2×target → area score ≈ 1.0 + ln(2)/ln(target+1)
const MASTERY_SOFT_CAP_LOG_FACTOR = 1;

const MASTERY_WEIGHT_FOUNDATION = 0.4;
const MASTERY_WEIGHT_EXECUTION  = 0.4;
const MASTERY_WEIGHT_MATURITY   = 0.2;

// Number of focus areas to pre-select when opening a session dialog.
const SUGGESTED_FOCUS_COUNT = 3;

// Progress thresholds for status derivation.
const PROGRESS_THRESHOLD_DONE     = 90;
const PROGRESS_THRESHOLD_ARCHIVED = 10;

// Progress thresholds for initial focus suggestion.
const PROGRESS_EARLY_STAGE = 40;
const PROGRESS_MID_STAGE   = 80;

// ---------------------------------------------------------------------------
// Focus area groupings
// ---------------------------------------------------------------------------

const FOUNDATION_AREAS: TrainingFocus[] = ['melody', 'harmony', 'rhythm'];
const EXECUTION_AREAS:  TrainingFocus[] = ['technique', 'form', 'expression'];
const MATURITY_AREAS:   TrainingFocus[] = ['finishing', 'memorize', 'improv'];

// ---------------------------------------------------------------------------

export function process(song: UserSong) {
    const targets = song.genre && refData.genres.find((v) => v.name === song.genre)?.masteryTargets || {};
    const getFocusTarget = (focus: TrainingFocus) => targets[focus] ?? DEFAULT_MASTERY_TARGETS[focus];

    function suggestFromMasteryGaps(count = SUGGESTED_FOCUS_COUNT): TrainingFocus[] {
        const belowTarget = (k: TrainingFocus) => (song.mastery[k] ?? 0) < getFocusTarget(k);
        const allAreas: TrainingFocus[] = [
            ...FOUNDATION_AREAS.filter(belowTarget),
            ...EXECUTION_AREAS.filter(belowTarget),
            ...MATURITY_AREAS,
        ];
        return allAreas.slice(0, count);
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

    return {
        getFocusTarget,

        statusFromProgress(newValue: number, oldValue: number): boolean {
            if (newValue > PROGRESS_THRESHOLD_DONE) {
                song.status = 'done';
                return true;
            }
            if (newValue < oldValue && newValue < PROGRESS_THRESHOLD_ARCHIVED) {
                song.status = 'archived';
                return true;
            }
            if (newValue < oldValue && song.status !== 'repeat') {
                song.status = 'repeat';
                return true;
            }
            if (newValue > oldValue && song.status !== 'wip') {
                song.status = 'wip';
                return true;
            }
            return false;
        },

        progressFromMastery(): number | undefined {
            const normalizeAreaScore = (focus: TrainingFocus): number => {
                const raw = song.mastery[focus] ?? 0;
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

            if (song.mastery && Object.keys(song.mastery).length) {
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
        },

        /**
         * Applies a session diff to a song in place.
         * Merges focus into mastery, then recomputes progressResult.
         * Falls back to diff.progress when mastery is absent.
         */
        applyPropsFrom(diff: Partial<SongDiff>): void {
            if (diff.tags) {
                song.tags = diff.tags;
            }
            if (diff.notes) {
                song.notes = diff.notes;
            }
            if (diff.areas) {
                if (!song.mastery) {
                    song.mastery = {};
                }
                for (const [key, value] of Object.entries(diff.areas) as [TrainingFocus, number][]) {
                    song.mastery[key] = (song.mastery[key] ?? 0) + value;
                }
            }

            const derivedProgress = this.progressFromMastery() ?? diff.progress;
            const oldProgress     = song.progressResult ?? 0;
            const newProgress     = derivedProgress ?? oldProgress;

            if (newProgress !== oldProgress) {
                song.progressResult = newProgress;
                this.statusFromProgress(newProgress, oldProgress);
            }
        },

        suggestInitialFocus(): TrainingFocus[] {
            if (song.mastery && Object.keys(song.mastery).length > 0) {
                return suggestFromMasteryGaps();
            }
            return suggestFromProgress(song.progress ?? 0);
        },

        quickSessionFocus(deltaPerArea = 1): SongDiff['areas'] {
            const suggested: TrainingFocus[] = this.suggestInitialFocus();
            return Object.fromEntries(suggested.map((key) => [key, deltaPerArea]));
        },
    };
}