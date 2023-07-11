import { describe, it, expect, beforeEach } from 'vitest';
import { usersongs } from './song.store';
import type { UserSong } from '../model/song.model';

const demoSong: UserSong = {
    id: 'abc',
    uid: 'xyz',
    status: 'todo',
    title: 'example',
    artist: 'demo',
    genre: 'generic',
    tags: [],
};

describe('song store', () => {
    beforeEach(() => usersongs.set([]));

    it('should push an item', () => {
        expect(usersongs.isEmpty).toBe(true);

        usersongs.push(demoSong);
        expect(usersongs.isEmpty).toBe(false);
    });

    it('should pop an item from the store', () => {
        expect(usersongs.isEmpty).toBe(true);
        usersongs.push(demoSong);

        expect(usersongs.pop()).toBe(demoSong);
        expect(usersongs.isEmpty).toBe(true);

        expect(usersongs.pop()).toBeUndefined();
        expect(usersongs.isEmpty).toBe(true);
    });

    it('should check if empty', () => {
        expect(usersongs.isEmpty).toBe(true);

        usersongs.push(demoSong);
        expect(usersongs.isEmpty).toBe(false);

        usersongs.set([]);
        expect(usersongs.isEmpty).toBe(true);
    });
});
