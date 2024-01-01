import { describe, it, expect, beforeEach } from 'vitest';
import { ArrayStore } from './array.class';

const store = new ArrayStore<object>();
const demo = {
    id: 'abc',
    uid: 'xyz',
    status: 'todo',
    title: 'example',
    artist: 'demo',
    genre: 'generic',
    tags: [],
};

describe('song store', () => {
    beforeEach(() => store.set([]));

    it('should push an item', () => {
        expect(store.isEmpty).toBe(true);

        store.push(demo);
        expect(store.isEmpty).toBe(false);
    });

    it('should pop an item from the store', () => {
        expect(store.isEmpty).toBe(true);
        store.push(demo);

        expect(store.pop()).toBe(demo);
        expect(store.isEmpty).toBe(true);

        expect(store.pop()).toBeUndefined();
        expect(store.isEmpty).toBe(true);
    });

    it('should check if empty', () => {
        expect(store.isEmpty).toBe(true);

        store.push(demo);
        expect(store.isEmpty).toBe(false);

        store.set([]);
        expect(store.isEmpty).toBe(true);
    });
});
