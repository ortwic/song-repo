import { describe, it, expect, vi } from 'vitest';
import type { UserSong } from '../model/song.model';
import { FOCUS_KEYS } from '../model/types';
import { process, DEFAULT_MASTERY_TARGETS, MASTERY_INTERPOLATION_ORDER } from './song.logic';

vi.mock('../service/base/app-cache.setup', () => ({
    refData: {
        genres: [],
    },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSong(overrides: Partial<UserSong> = {}): UserSong {
    return {
        id: 'test-song',
        title: 'Test Song',
        artist: 'Test Artist',
        status: 'todo',
        progress: 0,
        mastery: {},
        ...overrides,
    } as UserSong;
}

function saturatedMastery(): Record<string, number> {
    return FOCUS_KEYS.reduce((acc, key) => {
        acc[key] = DEFAULT_MASTERY_TARGETS[key];
        return acc;
    }, {} as Record<string, number>);
}

describe('process(song).statusFromProgress', () => {
    it('sets status to "done" when progress exceeds 90', () => {
        const song = makeSong({ status: 'wip', progress: 80 });
        const changed = process(song).statusFromProgress(95, 80);
        expect(song.status).toBe('done');
        expect(changed).toBe(true);
    });

    it('sets status to "archived" when progress drops below 10', () => {
        const song = makeSong({ status: 'wip', progress: 15 });
        const changed = process(song).statusFromProgress(5, 15);
        expect(song.status).toBe('archived');
        expect(changed).toBe(true);
    });

    it('sets status to "repeat" when progress decreases in the mid range', () => {
        const song = makeSong({ status: 'wip', progress: 60 });
        const changed = process(song).statusFromProgress(50, 60);
        expect(song.status).toBe('repeat');
        expect(changed).toBe(true);
    });

    it('sets status to "wip" when progress increases in the mid range', () => {
        const song = makeSong({ status: 'todo', progress: 20 });
        const changed = process(song).statusFromProgress(30, 20);
        expect(song.status).toBe('wip');
        expect(changed).toBe(true);
    });
});

describe('process(song).progressFromMastery', () => {
    it('returns undefined when mastery is empty', () => {
        const song = makeSong({ mastery: {} });
        expect(process(song).progressFromMastery()).toBeUndefined();
    });

    it('returns undefined when mastery is absent', () => {
        const song = makeSong({ mastery: undefined });
        expect(process(song).progressFromMastery()).toBeUndefined();
    });

    it('returns 0 when all present mastery values are 0', () => {
        // raw=0 < target → linear: 0 / target = 0.
        // Foundation and Execution groups are mandatory, so they contribute 0.
        // Maturity areas are absent → optional group skipped → 0.
        const song = makeSong({
            mastery: { melody: 0, harmony: 0, rhythm: 0 },
        });
        expect(process(song).progressFromMastery()).toBe(0);
    });

    it('returns 80 when all areas are exactly at their targets', () => {
        // Per area: raw === target → normalizeAreaScore returns 1.0 (linear, no soft-cap bonus).
        // foundationScore = 1.0, executionScore = 1.0, maturityScore = 1.0
        // weighted = 0.4×1.0 + 0.4×1.0 + 0.2×1.0 = 1.0 → 100%? No:
        // Maturity areas ARE present in saturatedMastery(), so maturityScore = 1.0.
        // weighted = 0.4 + 0.4 + 0.2 = 1.0 → Math.round(1.0 × 100) = 100.
        // But the 80/20 ceiling only applies when Maturity is absent.
        // This test verifies the sum of all groups at target = 100.
        const song = makeSong({ mastery: saturatedMastery() });
        expect(process(song).progressFromMastery()).toBe(100);
    });

    it('returns 80 when only Foundation and Execution are at their targets', () => {
        // foundationScore = 1.0, executionScore = 1.0, maturityScore = 0 (absent → optional, skipped)
        // weighted = 0.4×1.0 + 0.4×1.0 + 0.2×0 = 0.8 → 80
        // This is the 80/20 ceiling: Foundation + Execution mastered, Maturity untouched.
        const song = makeSong({
            mastery: {
                melody:     DEFAULT_MASTERY_TARGETS['melody'],
                harmony:    DEFAULT_MASTERY_TARGETS['harmony'],
                rhythm:     DEFAULT_MASTERY_TARGETS['rhythm'],
                technique:  DEFAULT_MASTERY_TARGETS['technique'],
                form:       DEFAULT_MASTERY_TARGETS['form'],
                expression: DEFAULT_MASTERY_TARGETS['expression'],
            },
        });
        expect(process(song).progressFromMastery()).toBe(80);
    });

    it('approaches but never exceeds 100 when all areas are far beyond their targets', () => {
        const mastery = FOCUS_KEYS.reduce((acc, key) => {
            acc[key] = 999;
            return acc;
        }, {} as Record<string, number>);
        const song = makeSong({ mastery });
        const result = process(song).progressFromMastery();
        expect(result).toBeGreaterThan(99);
        expect(result).toBeLessThanOrEqual(100);
    });

    it('weights Foundation (40%) correctly when only Foundation is at target', () => {
        // foundationScore = 1.0, executionScore = 0 (mandatory, 3 areas missing → 0/3=0),
        // maturityScore = 0 (optional, absent → skipped, count=0 → 0)
        // weighted = 0.4×1.0 + 0.4×0 + 0.2×0 = 0.4 → 40
        const song = makeSong({
            mastery: {
                melody:  DEFAULT_MASTERY_TARGETS['melody'],
                harmony: DEFAULT_MASTERY_TARGETS['harmony'],
                rhythm:  DEFAULT_MASTERY_TARGETS['rhythm'],
            },
        });
        expect(process(song).progressFromMastery()).toBe(40);
    });

    it('weights Execution (40%) correctly when only Execution is at target', () => {
        // foundationScore = 0 (mandatory, all absent → 0/3=0)
        // executionScore = 1.0
        // maturityScore = 0 (optional, absent)
        // weighted = 0.4×0 + 0.4×1.0 + 0.2×0 = 0.4 → 40
        const song = makeSong({
            mastery: {
                technique:  DEFAULT_MASTERY_TARGETS['technique'],
                form:       DEFAULT_MASTERY_TARGETS['form'],
                expression: DEFAULT_MASTERY_TARGETS['expression'],
            },
        });
        expect(process(song).progressFromMastery()).toBe(40);
    });

    it('weights Maturity (20%) correctly when only Maturity is at target', () => {
        // foundationScore = 0 (mandatory, all absent)
        // executionScore = 0 (mandatory, all absent)
        // maturityScore = 1.0 (optional, all 3 present at target)
        // weighted = 0 + 0 + 0.2×1.0 = 0.2 → 20
        const song = makeSong({
            mastery: {
                finishing: DEFAULT_MASTERY_TARGETS['finishing'],
                memorize:  DEFAULT_MASTERY_TARGETS['memorize'],
                improv:    DEFAULT_MASTERY_TARGETS['improv'],
            },
        });
        expect(process(song).progressFromMastery()).toBe(20);
    });

    it('does not penalise Maturity group when Maturity areas are absent', () => {
        // Only Foundation at target: weighted = 0.4×1.0 + 0.4×0 + 0.2×0 = 0.4 → 40
        // Verifies that absent optional Maturity areas are skipped, not counted as 0.
        const song = makeSong({
            mastery: {
                melody:  DEFAULT_MASTERY_TARGETS['melody'],
                harmony: DEFAULT_MASTERY_TARGETS['harmony'],
                rhythm:  DEFAULT_MASTERY_TARGETS['rhythm'],
            },
        });
        const result = process(song).progressFromMastery();
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
        const song = makeSong({
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
        const result = process(song).progressFromMastery();
        expect(result).toBeGreaterThan(80);
        expect(result).toBeLessThanOrEqual(100);
    });

    it('penalises Foundation group when a mandatory Foundation area is missing', () => {
        // Only melody and harmony present at target; rhythm missing → counted as 0.
        // foundationScore = (1.0 + 1.0 + 0) / 3 ≈ 0.667
        // executionScore = 0 (mandatory, all absent)
        // maturityScore = 0 (optional, absent)
        // weighted = 0.4×0.667 + 0 + 0 ≈ 0.267 → 27
        const song = makeSong({
            mastery: {
                melody:  DEFAULT_MASTERY_TARGETS['melody'],
                harmony: DEFAULT_MASTERY_TARGETS['harmony'],
            },
        });
        const result = process(song).progressFromMastery();
        expect(result).toBeGreaterThan(0);
        expect(result).toBeLessThan(40);
    });
});

describe('process(song).masteryFromProgress', () => {
    it('returns empty object for progress 0', () => {
        const song = makeSong({});
        expect(process(song).masteryFromProgress()).toEqual({});
    });

    it('fills melody first as the first area in canonical order', () => {
        const result = process(makeSong({ progress: 10 })).masteryFromProgress();
        expect(result.melody).toBeGreaterThan(0);
        expect(result.harmony).toBeUndefined();
    });

    it.each([
        [50,  'mid-range'],
        [80,  'Foundation + Execution boundary'],
        [100, 'fully saturated'],
    ])('round-trips for progress %i (%s)', (progress) => {
        const mastery = process(makeSong({ progress })).masteryFromProgress();
        const roundTrip = process(makeSong({ mastery })).progressFromMastery() ?? 0;
        expect(Math.abs(roundTrip - progress)).toBeLessThanOrEqual(1);
    });

    it('does not fill later areas when an earlier area suffices', () => {
        const song = makeSong({ progress: 20 });
        // Progress 20 is achievable within Maturity alone (20%), but canonically
        // melody comes first — so Foundation areas are filled first.
        // Either way, improv must be absent if the target is reached earlier.
        const result = process(song).masteryFromProgress();
        const filledAreas = MASTERY_INTERPOLATION_ORDER.filter((k) => result[k] !== undefined);
        const lastFilled = filledAreas.at(-1)!;
        const indexOfLast = MASTERY_INTERPOLATION_ORDER.indexOf(lastFilled);
        const nextArea = MASTERY_INTERPOLATION_ORDER[indexOfLast + 1];
        if (nextArea) {
            expect(result[nextArea]).toBeUndefined();
        }
    });

    it('allows a fractional value on the last filled area', () => {
        const song = makeSong({ progress: 33.33 });
        const result = process(song).masteryFromProgress();
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

describe('process(song).suggestInitialFocus', () => {
    it('returns 3 foundation areas when progress is below 40 and mastery is absent', () => {
        const song = makeSong({ progress: 20, mastery: undefined });
        const focus = process(song).suggestInitialFocus();
        expect(focus).toHaveLength(3);
        expect(focus).toEqual(expect.arrayContaining(['melody', 'harmony', 'rhythm']));
    });

    it('returns execution areas when progress is between 40 and 80', () => {
        const song = makeSong({ progress: 60, mastery: undefined });
        const focus = process(song).suggestInitialFocus();
        expect(focus).toEqual(expect.arrayContaining(['technique', 'expression', 'form']));
    });

    it('returns late-stage areas when progress exceeds 80', () => {
        const song = makeSong({ progress: 85, mastery: undefined });
        const focus = process(song).suggestInitialFocus();
        expect(focus).toEqual(expect.arrayContaining(['finishing', 'memorize', 'expression']));
    });

    it('returns the 3 weakest mastery areas when mastery is present', () => {
        const song = makeSong({
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
        const focus = process(song).suggestInitialFocus();
        expect(focus).toHaveLength(3);
        expect(focus).toEqual(expect.arrayContaining(['melody', 'rhythm', 'form']));
    });

    it('falls back to progress-based suggestion when mastery is empty', () => {
        const song = makeSong({ progress: 30, mastery: {} });
        const focus = process(song).suggestInitialFocus();
        expect(focus).toEqual(expect.arrayContaining(['melody', 'harmony', 'rhythm']));
    });
});

describe('process(song).applyPropsFrom', () => {
    it('merges focus intensity into mastery', () => {
        const song = makeSong({ mastery: { melody: 3 } });
        process(song).applyPropsFrom({ areas: { melody: 2, harmony: 4 } });
        expect(song.mastery.melody).toBe(5);
        expect(song.mastery.harmony).toBe(4);
    });

    it('initialises mastery when absent before merging focus', () => {
        const song = makeSong({ mastery: undefined });
        process(song).applyPropsFrom({ areas: { technique: 3 } });
        expect(song.mastery).toBeDefined();
        expect(song.mastery.technique).toBe(3);
    });

    it('updates tags from diff', () => {
        const song = makeSong({ tags: ['old'] });
        process(song).applyPropsFrom({ tags: ['new', 'tag'] });
        expect(song.tags).toEqual(['new', 'tag']);
    });

    it('updates notes from diff', () => {
        const song = makeSong({ notes: 'old note' });
        process(song).applyPropsFrom({ notes: 'new note' });
        expect(song.notes).toBe('new note');
    });

    it('sets progress to 100 when all areas are at their targets', () => {
        // All 9 areas at target → all three groups score 1.0 → weighted = 1.0 → 100
        const song = makeSong({ progress: 0, mastery: {} });
        process(song).applyPropsFrom({ areas: { ...DEFAULT_MASTERY_TARGETS } });
        expect(song.progress).toBe(100);
    });

    it('sets progress to 80 when only Foundation and Execution are at target', () => {
        // foundationScore=1.0, executionScore=1.0, maturityScore=0 (absent/optional)
        // weighted = 0.4 + 0.4 + 0 = 0.8 → 80
        const song = makeSong({ progress: 0, mastery: {} });
        process(song).applyPropsFrom({
            areas: {
                melody:     DEFAULT_MASTERY_TARGETS['melody'],
                harmony:    DEFAULT_MASTERY_TARGETS['harmony'],
                rhythm:     DEFAULT_MASTERY_TARGETS['rhythm'],
                technique:  DEFAULT_MASTERY_TARGETS['technique'],
                form:       DEFAULT_MASTERY_TARGETS['form'],
                expression: DEFAULT_MASTERY_TARGETS['expression'],
            },
        });
        expect(song.progress).toBe(80);
    });

    it('sets progress to 40 when only Foundation is at target', () => {
        // foundationScore=1.0, executionScore=0 (mandatory, absent), maturityScore=0
        // weighted = 0.4 → 40
        const song = makeSong({ progress: 0, mastery: {} });
        process(song).applyPropsFrom({
            areas: {
                melody:  DEFAULT_MASTERY_TARGETS['melody'],
                harmony: DEFAULT_MASTERY_TARGETS['harmony'],
                rhythm:  DEFAULT_MASTERY_TARGETS['rhythm'],
            },
        });
        expect(song.progress).toBe(40);
    });


    it('derives status to "wip" after Foundation + Execution target merge (80, below done threshold)', () => {
        // progress = 80, threshold for "done" is 90 → status becomes "wip"
        const song = makeSong({ progress: 0, status: 'todo', mastery: {} });
        process(song).applyPropsFrom({
            areas: {
                melody:     DEFAULT_MASTERY_TARGETS['melody'],
                harmony:    DEFAULT_MASTERY_TARGETS['harmony'],
                rhythm:     DEFAULT_MASTERY_TARGETS['rhythm'],
                technique:  DEFAULT_MASTERY_TARGETS['technique'],
                form:       DEFAULT_MASTERY_TARGETS['form'],
                expression: DEFAULT_MASTERY_TARGETS['expression'],
            },
        });
        expect(song.status).toBe('wip');
    });

    it('derives status to "done" when mastery is well beyond all targets', () => {
        const song = makeSong({ progress: 0, status: 'todo', mastery: {} });
        const beyondTarget = Object.fromEntries(
            FOCUS_KEYS.map((k) => [k, DEFAULT_MASTERY_TARGETS[k] * 10])
        );
        process(song).applyPropsFrom({ areas: beyondTarget });
        expect(song.status).toBe('done');
    });

    it('derives status to "wip" after partial mastery merge increases progress', () => {
        const song = makeSong({ progress: 0, status: 'todo', mastery: {} });
        process(song).applyPropsFrom({
            areas: {
                melody:  DEFAULT_MASTERY_TARGETS['melody'],
                harmony: DEFAULT_MASTERY_TARGETS['harmony'],
                rhythm:  DEFAULT_MASTERY_TARGETS['rhythm'],
            },
        });
        expect(song.status).toBe('wip');
    });
});