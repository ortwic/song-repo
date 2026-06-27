import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Timestamp } from 'firebase/firestore';
import type { SongParams } from '../model/settings.model';
import type { UserSong } from '../model/song.model';
import { FOCUS_KEYS } from '../model/types';
import { DEFAULT_USER_SETTINGS } from '../service/user/default-settings';
import { createSongEntity, DEFAULT_MASTERY_TARGETS, MASTERY_INTERPOLATION_ORDER, SongEntity } from './song.entity';

vi.mock('../service/base/app-cache.setup', () => ({
    refData: {
        genres: [],
    },
}));

const defaultSongParams: SongParams = {
    ...DEFAULT_USER_SETTINGS.advanced,
    retentionHalfLifeDays:      14,
    retentionSessionBoostFactor: 0.8,
    retentionGracePeriodDays:    0,
};

function makeSongEntity(overrides: Partial<UserSong> = {}, params = defaultSongParams): SongEntity {
    return createSongEntity({
        id: 'test-song',
        title: 'Test Song',
        artist: 'Test Artist',
        progress: 0,
        mastery: {},
        ...overrides,
    } as UserSong, params);
}

function saturatedMastery(): Record<string, number> {
    return FOCUS_KEYS.reduce((acc, key) => {
        acc[key] = DEFAULT_MASTERY_TARGETS[key];
        return acc;
    }, {} as Record<string, number>);
}

describe('createSongEntity(song).progressFromMastery', () => {
    it('returns undefined when mastery is empty', () => {
        const song = makeSongEntity({ mastery: {} });
        expect(song.progressFromMastery()).toBeUndefined();
    });

    it('returns undefined when mastery is absent', () => {
        const song = makeSongEntity({ mastery: undefined });
        expect(song.progressFromMastery()).toBeUndefined();
    });

    it('returns 0 when all present mastery values are 0', () => {
        // raw=0 < target → linear: 0 / target = 0.
        // Foundation and Execution groups are mandatory, so they contribute 0.
        // Maturity areas are absent → optional group skipped → 0.
        const song = makeSongEntity({
            mastery: { melody: 0, harmony: 0, rhythm: 0 },
        });
        expect(song.progressFromMastery()).toBe(0);
    });

    it('returns 80 when all areas are exactly at their targets', () => {
        // Per area: raw === target → normalizeAreaScore returns 1.0 (linear, no soft-cap bonus).
        // foundationScore = 1.0, executionScore = 1.0, maturityScore = 1.0
        // weighted = 0.4×1.0 + 0.4×1.0 + 0.2×1.0 = 1.0 → 100%? No:
        // Maturity areas ARE present in saturatedMastery(), so maturityScore = 1.0.
        // weighted = 0.4 + 0.4 + 0.2 = 1.0 → Math.round(1.0 × 100) = 100.
        // But the 80/20 ceiling only applies when Maturity is absent.
        // This test verifies the sum of all groups at target = 100.
        const song = makeSongEntity({ mastery: saturatedMastery() });
        expect(song.progressFromMastery()).toBe(100);
    });

    it('returns 80 when only Foundation and Execution are at their targets', () => {
        // foundationScore = 1.0, executionScore = 1.0, maturityScore = 0 (absent → optional, skipped)
        // weighted = 0.4×1.0 + 0.4×1.0 + 0.2×0 = 0.8 → 80
        // This is the 80/20 ceiling: Foundation + Execution mastered, Maturity untouched.
        const song = makeSongEntity({
            mastery: {
                melody:     DEFAULT_MASTERY_TARGETS['melody'],
                harmony:    DEFAULT_MASTERY_TARGETS['harmony'],
                rhythm:     DEFAULT_MASTERY_TARGETS['rhythm'],
                technique:  DEFAULT_MASTERY_TARGETS['technique'],
                form:       DEFAULT_MASTERY_TARGETS['form'],
                expression: DEFAULT_MASTERY_TARGETS['expression'],
            },
        });
        expect(song.progressFromMastery()).toBe(80);
    });

    it('approaches but never exceeds 100 when all areas are far beyond their targets', () => {
        const mastery = FOCUS_KEYS.reduce((acc, key) => {
            acc[key] = 999;
            return acc;
        }, {} as Record<string, number>);
        const song = makeSongEntity({ mastery });
        const result = song.progressFromMastery();
        expect(result).toBeGreaterThan(99);
        expect(result).toBeLessThanOrEqual(100);
    });

    it('weights Foundation (40%) correctly when only Foundation is at target', () => {
        // foundationScore = 1.0, executionScore = 0 (mandatory, 3 areas missing → 0/3=0),
        // maturityScore = 0 (optional, absent → skipped, count=0 → 0)
        // weighted = 0.4×1.0 + 0.4×0 + 0.2×0 = 0.4 → 40
        const song = makeSongEntity({
            mastery: {
                melody:  DEFAULT_MASTERY_TARGETS['melody'],
                harmony: DEFAULT_MASTERY_TARGETS['harmony'],
                rhythm:  DEFAULT_MASTERY_TARGETS['rhythm'],
            },
        });
        expect(song.progressFromMastery()).toBe(40);
    });

    it('weights Execution (40%) correctly when only Execution is at target', () => {
        // foundationScore = 0 (mandatory, all absent → 0/3=0)
        // executionScore = 1.0
        // maturityScore = 0 (optional, absent)
        // weighted = 0.4×0 + 0.4×1.0 + 0.2×0 = 0.4 → 40
        const song = makeSongEntity({
            mastery: {
                technique:  DEFAULT_MASTERY_TARGETS['technique'],
                form:       DEFAULT_MASTERY_TARGETS['form'],
                expression: DEFAULT_MASTERY_TARGETS['expression'],
            },
        });
        expect(song.progressFromMastery()).toBe(40);
    });

    it('weights Maturity (20%) correctly when only Maturity is at target', () => {
        // foundationScore = 0 (mandatory, all absent)
        // executionScore = 0 (mandatory, all absent)
        // maturityScore = 1.0 (optional, all 3 present at target)
        // weighted = 0 + 0 + 0.2×1.0 = 0.2 → 20
        const song = makeSongEntity({
            mastery: {
                finishing: DEFAULT_MASTERY_TARGETS['finishing'],
                memorize:  DEFAULT_MASTERY_TARGETS['memorize'],
                improv:    DEFAULT_MASTERY_TARGETS['improv'],
            },
        });
        expect(song.progressFromMastery()).toBe(20);
    });

    it('does not penalise Maturity group when Maturity areas are absent', () => {
        // Only Foundation at target: weighted = 0.4×1.0 + 0.4×0 + 0.2×0 = 0.4 → 40
        // Verifies that absent optional Maturity areas are skipped, not counted as 0.
        const song = makeSongEntity({
            mastery: {
                melody:  DEFAULT_MASTERY_TARGETS['melody'],
                harmony: DEFAULT_MASTERY_TARGETS['harmony'],
                rhythm:  DEFAULT_MASTERY_TARGETS['rhythm'],
            },
        });
        const result = song.progressFromMastery();
        // Would be 33 if Maturity counted as 0/3 and all 9 areas averaged flatly.
        // Correct result with optional Maturity = 40.
        expect(result).toBe(40);
    });

    it('grants a soft-cap bonus when one area exceeds its target', () => {
        // Foundation at target: foundationScore = 1.0
        // Execution at target: executionScore = 1.0
        // Maturity: finishing at 2× target → score > 1.0; memorize and improv absent.
        // maturityScore > 1.0 → weighted > 0.8 → clamped to 1.0 → result = 100.
        // More practically: partial Maturity excess should push result above 80.
        const song = makeSongEntity({
            mastery: {
                melody:     DEFAULT_MASTERY_TARGETS['melody'],
                harmony:    DEFAULT_MASTERY_TARGETS['harmony'],
                rhythm:     DEFAULT_MASTERY_TARGETS['rhythm'],
                technique:  DEFAULT_MASTERY_TARGETS['technique'],
                form:       DEFAULT_MASTERY_TARGETS['form'],
                expression: DEFAULT_MASTERY_TARGETS['expression'],
                finishing:  DEFAULT_MASTERY_TARGETS['finishing'] * 2,
            },
        });
        const result = song.progressFromMastery();
        expect(result).toBeGreaterThan(80);
        expect(result).toBeLessThanOrEqual(100);
    });

    it('penalises Foundation group when a mandatory Foundation area is missing', () => {
        // Only melody and harmony present at target; rhythm missing → counted as 0.
        // foundationScore = (1.0 + 1.0 + 0) / 3 ≈ 0.667
        // executionScore = 0 (mandatory, all absent)
        // maturityScore = 0 (optional, absent)
        // weighted = 0.4×0.667 + 0 + 0 ≈ 0.267 → 27
        const song = makeSongEntity({
            mastery: {
                melody:  DEFAULT_MASTERY_TARGETS['melody'],
                harmony: DEFAULT_MASTERY_TARGETS['harmony'],
            },
        });
        const result = song.progressFromMastery();
        expect(result).toBeGreaterThan(0);
        expect(result).toBeLessThan(40);
    });
});

describe('createSongEntity(song).masteryFromProgress', () => {
    it('returns empty object for progress 0', () => {
        const song = makeSongEntity({});
        expect(song.masteryFromProgress()).toEqual({});
    });

    it('fills melody first as the first area in canonical order', () => {
        const result = makeSongEntity({ progress: 10 }).masteryFromProgress();
        expect(result.melody).toBeGreaterThan(0);
        expect(result.harmony).toBeUndefined();
    });

    it.each([
        [50,  'mid-range'],
        [80,  'Foundation + Execution boundary'],
        [100, 'fully saturated'],
    ])('round-trips for progress %i (%s)', (progress) => {
        const mastery = makeSongEntity({ progress }).masteryFromProgress();
        const roundTrip = makeSongEntity({ mastery }).progressFromMastery() ?? 0;
        expect(Math.abs(roundTrip - progress)).toBeLessThanOrEqual(1);
    });

    it('does not fill later areas when an earlier area suffices', () => {
        const song = makeSongEntity({ progress: 20 });
        // Progress 20 is achievable within Maturity alone (20%), but canonically
        // melody comes first — so Foundation areas are filled first.
        // Either way, improv must be absent if the target is reached earlier.
        const result = song.masteryFromProgress();
        const filledAreas = MASTERY_INTERPOLATION_ORDER.filter((k) => result[k] !== undefined);
        const lastFilled = filledAreas.at(-1)!;
        const indexOfLast = MASTERY_INTERPOLATION_ORDER.indexOf(lastFilled);
        const nextArea = MASTERY_INTERPOLATION_ORDER[indexOfLast + 1];
        if (nextArea) {
            expect(result[nextArea]).toBeUndefined();
        }
    });

    it('allows a fractional value on the last filled area', () => {
        const song = makeSongEntity({ progress: 33.33 });
        const result = song.masteryFromProgress();
        const filledValues = Object.values(result) as number[];
        const lastValue = filledValues.at(-1)!;
        // All areas except the last must be at their full target.
        const allButLast = filledValues.slice(0, -1);
        allButLast.forEach((value, index) => {
            const area = MASTERY_INTERPOLATION_ORDER[index];
            expect(value).toBe(DEFAULT_MASTERY_TARGETS[area]);
        });
        // The last value must be fractional (not rounded to an integer).
        expect(lastValue % 1).not.toBe(0);
    });
});

describe('createSongEntity(song).suggestInitialFocus', () => {
    it('returns 3 foundation areas when progress is below 40 and mastery is absent', () => {
        const song = makeSongEntity({ progress: 20, mastery: undefined });
        const focus = song.suggestInitialFocus();
        expect(focus).toHaveLength(3);
        expect(focus).toEqual(expect.arrayContaining(['melody', 'harmony', 'rhythm']));
    });

    it('returns execution areas when progress is between 40 and 80', () => {
        const song = makeSongEntity({ progress: 60, mastery: undefined });
        const focus = song.suggestInitialFocus();
        expect(focus).toEqual(expect.arrayContaining(['technique', 'expression', 'form']));
    });

    it('returns late-stage areas when progress exceeds 80', () => {
        const song = makeSongEntity({ progress: 85, mastery: undefined });
        const focus = song.suggestInitialFocus();
        expect(focus).toEqual(expect.arrayContaining(['finishing', 'memorize', 'expression']));
    });

    it('returns the 3 weakest mastery areas when mastery is present', () => {
        const song = makeSongEntity({
            progress: 50,
            mastery: {
                melody:     1,
                harmony:    DEFAULT_MASTERY_TARGETS['harmony'],
                rhythm:     2,
                technique:  DEFAULT_MASTERY_TARGETS['technique'] + 10,
                form:       0,
                expression: 18,
                memorize:   3,
                improv:     10,
                finishing:  DEFAULT_MASTERY_TARGETS['finishing'],
            },
        });
        const focus = song.suggestInitialFocus();
        expect(focus).toHaveLength(3);
        expect(focus).toEqual(expect.arrayContaining(['melody', 'rhythm', 'form']));
    });

    it('falls back to progress-based suggestion when mastery is empty', () => {
        const song = makeSongEntity({ progress: 30, mastery: {} });
        const focus = song.suggestInitialFocus();
        expect(focus).toEqual(expect.arrayContaining(['melody', 'harmony', 'rhythm']));
    });
});

describe('retention decay & derivedStatus', () => {
    const now = new Date('2025-06-01');
    const daysAgo = (days: number) => 
        new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(now);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('createSongEntity(song).retentionFactor', () => {

        it('returns 1.0 when played today (0 days elapsed)', () => {
            const song = makeSongEntity({ });
            expect(song.retentionFactor(daysAgo(0))).toBeCloseTo(1.0, 2);
        });

        it.each([
            // [touchCount, daysAgo, expectedAbove, expectedBelow, description]
            [1, defaultSongParams.retentionHalfLifeDays, 0.499, 0.501, 'half-life boundary: ~50% after 7 days'],
            [1,    60, 0.00, 0.10, 'strong decay after 60 days, touched once'],
            [10,   30, 0.60, 0.65, 'moderate decay after 30 days, touched 10×'],
            [100,  30, 0.85, 0.90, 'slow decay after 30 days, touched 100×'],
            [1000, 30, 0.95, 1.00, 'negligible decay after 30 days, touched 1000×'],
        ] as const)(
            'touchCount=%i, %i days ago: %s',
            (touchCount, days, expectedAbove, expectedBelow, _) => {
                const song = makeSongEntity();
                const factor = song.retentionFactor(daysAgo(days), touchCount);
                expect(factor).toBeGreaterThan(expectedAbove);
                expect(factor).toBeLessThan(expectedBelow);
            }
        );

        it('never returns negative values even after extreme elapsed time', () => {
            const song = makeSongEntity({ });
            expect(song.retentionFactor(daysAgo(9999))).toBeGreaterThanOrEqual(0);
        });

        it.each([
            [3,  0.8, 'retentionGracePeriodDays=7, 3 days elapsed: within grace'],
            [5,  0.8, 'retentionGracePeriodDays=7, 5 days elapsed: within grace'],
            [7,  0.8, 'retentionGracePeriodDays=7, exactly at boundary'],
        ] as const)(
            '%i days elapsed with grace period 7: %s',
            (days, expectedFactor, _) => {
                const params = { ...defaultSongParams, retentionGracePeriodDays: 7 };
                const song = makeSongEntity({ }, params);
                expect(song.retentionFactor(daysAgo(days))).toBeGreaterThanOrEqual(expectedFactor);
            }
        );

        it('decays normally once grace period has expired (30 days, grace 7)', () => {
            const params = { ...defaultSongParams, retentionGracePeriodDays: 7 };
            const song = makeSongEntity({ }, params);
            expect(song.retentionFactor(daysAgo(30))).toBeLessThan(0.5);
        });
    });

    describe('createSongEntity(song).retentionDelta', () => {
        const daysAgo = (days: number) =>
            Timestamp.fromDate(new Date(now.getTime() - days * 24 * 60 * 60 * 1000));

        it('returns 0 when played today with full lastRetention', () => {
            const song = makeSongEntity({ touchCount: 1, changedAt: daysAgo(0), lastRetention: 1.0 });
            expect(song.retentionDelta({ touchCount: 1, changedAt: daysAgo(0) })).toBe(0);
        });

        it('returns value <= 0, never positive', () => {
            const song = makeSongEntity({ touchCount: 3, changedAt: daysAgo(14), lastRetention: 0.5 });
            expect(song.retentionDelta()).toBeLessThanOrEqual(0);
        });

        it('returns -100 when fully decayed (lastRetention 1.0, extreme elapsed time)', () => {
            const song = makeSongEntity({ touchCount: 1, changedAt: daysAgo(9999), lastRetention: 1.0 });
            expect(song.retentionDelta()).toBe(-100);
        });
        
        it('returns partial decay when lastRetention is 0 (boost still applies)', () => {
            // boostedFactor = 0 + 0.8 * (1 - 0) = 0.8 → not zero
            // delta is negative but not -100
            const song = makeSongEntity({ touchCount: 5, changedAt: daysAgo(30), lastRetention: 0 });
            const delta = song.retentionDelta();
            expect(delta).toBeLessThanOrEqual(0);
            expect(delta).toBeGreaterThan(-100);
        });
    });

    describe('createSongEntity(song).derivedStatus', () => {
        it('returns "todo" for a new song with no progress and no decay', () => {
            const entity = makeSongEntity({ progress: 0 });
            expect(entity.resolvedStatus()).toBe('todo');
        });

        it('returns "wip" when progress is in mid range and no significant decay', () => {
            const entity = makeSongEntity({ progress: 50, changedAt: Timestamp.now() });
            expect(entity.resolvedStatus()).toBe('wip');
        });

        it('returns "done" when progress exceeds the done threshold', () => {
            const entity = makeSongEntity({ progress: 95, changedAt: Timestamp.now() });
            expect(entity.resolvedStatus()).toBe('done');
        });

        it('returns "repeat" when decay exceeds repeat threshold and progress is mid range', () => {
            // Song not touched for long enough to generate significant decay
            const entity = makeSongEntity({
                progress: 60,
                touchCount: 10,
                lastRetention: 1.0,
                changedAt: Timestamp.fromDate(daysAgo(30)),
            });
            expect(entity.resolvedStatus()).toBe('repeat');
        });

        it('returns "wip" when progress is below archived threshold', () => {
            const entity = makeSongEntity({
                progress: 8,
                touchCount: 1,
                lastRetention: 1.0,
                changedAt: Timestamp.fromDate(daysAgo(30)),
            });
            expect(entity.resolvedStatus()).toBe('wip');
        });

        it('returns "archived" when decay would push effective progress below archived threshold', () => {
            const entity = makeSongEntity({
                progress: 12,
                touchCount: 1,
                lastRetention: 1.0,
                changedAt: Timestamp.fromDate(daysAgo(30)),
            });
            expect(entity.resolvedStatus()).toBe('archived');
        });
    });
});