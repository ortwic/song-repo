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
    tags: []
};

describe("song store", () => {

    beforeEach(() => usersongs.set([]));

    it("should push an item", () => {
        expect(usersongs.isEmpty).toBe(true);

        usersongs.push(demoSong);
        expect(usersongs.isEmpty).toBe(false);
    });

    it("should pop an item from the store", () => {
        expect(usersongs.isEmpty).toBe(true);
        usersongs.push(demoSong);

        expect(usersongs.pop()).toBe(demoSong);
        expect(usersongs.isEmpty).toBe(true);

        expect(usersongs.pop()).toBeUndefined();
        expect(usersongs.isEmpty).toBe(true);
    });

    it("should replace or add item", () => {
        const song1 = { id: 'a', title: 'Song 1', tags: [], status: 'todo' } as UserSong;
        const song2 = { id: 'b', title: 'Song 2', tags: [], status: 'wip' } as UserSong;
        const getAll = () => {
            let result: UserSong[];
            usersongs.subscribe(items => result = items);
            return result;
        };
        
        // Arrange
        usersongs.set([song1, song2]);
        expect(usersongs.length).toBe(2);
    
        // Replace an existing item
        usersongs.replace({ id: 'b', title: 'Updated Song', status: 'done' } as UserSong, 'id');
        const replacedItem = getAll().find(s => s.id === 'b');
        expect(replacedItem.status).toBe('done');
        expect(replacedItem.title).toBe('Updated Song');
        expect(usersongs.length).toBe(2);
    
        // Add a new item
        usersongs.replace({ id: 'c', title: 'New Song' } as UserSong, 'id');
        const newItem = getAll().find(s => s.id === 'c');
        expect(newItem.title).toBe('New Song');
        expect(usersongs.length).toBe(3);
    });

    it("should check if empty", () => {
        expect(usersongs.isEmpty).toBe(true);

        usersongs.push(demoSong);
        expect(usersongs.isEmpty).toBe(false);

        usersongs.set([]);
        expect(usersongs.isEmpty).toBe(true);
    });
});