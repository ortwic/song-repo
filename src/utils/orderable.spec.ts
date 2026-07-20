import { describe, expect, it } from 'vitest';
import { nextOrder, swapOrder, type Orderable } from './orderable';

describe('swapOrder', () => {
    it('returns null when moving past the start of the list', () => {
        const items: Orderable[] = [
            { id: 'a', order: 0 },
            { id: 'b', order: 1 },
        ];

        expect(swapOrder(items, 0, -1)).toBeNull();
    });

    it('returns null when moving past the end of the list', () => {
        const items: Orderable[] = [
            { id: 'a', order: 0 },
            { id: 'b', order: 1 },
        ];

        expect(swapOrder(items, 1, 1)).toBeNull();
    });

    it('exchanges the real order values of two adjacent items', () => {
        const items: Orderable[] = [
            { id: 'a', order: 0 },
            { id: 'b', order: 1 },
            { id: 'c', order: 2 },
        ];

        const updates = swapOrder(items, 1, 1);

        expect(updates).toEqual([
            { id: 'b', order: 2 },
            { id: 'c', order: 1 },
        ]);
    });

    it('generates a fresh, unused value when both items are missing an order field', () => {
        const items: Orderable[] = [{ id: 'a' }, { id: 'b' }];

        const updates = swapOrder(items, 0, 1);
        const orderValues = updates?.map((u) => u.order) ?? [];

        expect(new Set(orderValues).size).toBe(orderValues.length);
    });

    // This reproduces the manual test that exposed the bug: 5 items with order
    // 1-5, item 3 gets deleted, a new item is appended (receiving order 6 via
    // nextOrder), and the new item is then moved up. The swap must exchange
    // the real order values (5 and 6) instead of deriving values from array
    // indices — otherwise the new item's neighbor ends up with the same order
    // value as an unrelated, untouched item (order 4 in this case).
    it("does not duplicate an untouched item's order value after delete + add + move", () => {
        // Original 5 items: order 1, 2, 3, 4, 5. Item with order 3 is deleted.
        const afterDelete: Orderable[] = [
            { id: '1', order: 1 },
            { id: '2', order: 2 },
            { id: '4', order: 4 },
            { id: '5', order: 5 },
        ];

        const newItemOrder = nextOrder(afterDelete);
        expect(newItemOrder).toBe(6);

        const afterAdd: Orderable[] = [...afterDelete, { id: 'new', order: newItemOrder }];

        // afterAdd sorted by order: 1, 2, 4, 5, 6(new) -> new item is at index 4
        const updates = swapOrder(afterAdd, 4, -1);

        expect(updates).toEqual([
            { id: 'new', order: 5 },
            { id: '5', order: 6 },
        ]);

        const untouchedItem = afterAdd.find((item) => item.id === '4');
        const orderValuesAfterSwap = [...updates!.map((u) => u.order), untouchedItem?.order];

        expect(new Set(orderValuesAfterSwap).size).toBe(orderValuesAfterSwap.length);
    });
});

describe('nextOrder', () => {
    it('returns 0 for an empty list', () => {
        expect(nextOrder([])).toBe(0);
    });

    it('returns the item count when no item has an order field', () => {
        const items: Orderable[] = [{ id: 'a' }, { id: 'b' }];

        expect(nextOrder(items)).toBe(2);
    });

    it('returns the highest existing order value plus one, ignoring the item count', () => {
        // 4 items remain after a delete, but the highest order value is 5,
        // not 4 — nextOrder must not fall back to the item count here.
        const itemsAfterDeletion: Orderable[] = [
            { id: 'a', order: 1 },
            { id: 'b', order: 2 },
            { id: 'c', order: 4 },
            { id: 'd', order: 5 },
        ];

        expect(nextOrder(itemsAfterDeletion)).toBe(6);
    });
});
