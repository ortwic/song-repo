import { describe, it, expect, beforeEach } from 'vitest';
import { songs } from './song.store';
import type { Song } from '../model/song.model';

const demoSong: Song = {
    uid: 'xyz',
    status: 'todo',
    title: 'example',
    artist: 'demo',
    genre: 'generic',
    tags: []
};

describe("song store", () => {

    beforeEach(() => songs.set([]));

    it("should push an item", () => {
        expect(songs.isEmpty).toBe(true);

        songs.push(demoSong);
        expect(songs.isEmpty).toBe(false);
    });

    it("should pop an item from the store", () => {
        expect(songs.isEmpty).toBe(true);
        songs.push(demoSong);

        expect(songs.pop()).toBe(demoSong);
        expect(songs.isEmpty).toBe(true);

        expect(songs.pop()).toBeUndefined();
        expect(songs.isEmpty).toBe(true);
    });

    it("should replace or add item", () => {
        const song1: Song = { uid: 'a', title: 'Song 1', tags: [], status: 'todo' };
        const song2: Song = { uid: 'b', title: 'Song 2', tags: [], status: 'wip' };
        const getKey = (item: Song) => item.uid;
        const getAll = () => {
            let result: Song[];
            songs.subscribe(items => result = items);
            return result;
        };
        
        // Arrange
        songs.set([song1, song2]);
        expect(songs.length).toBe(2);
    
        // Replace an existing item
        songs.replace({ uid: 'b', title: 'Updated Song', status: 'done' } as Song, getKey);
        const replacedItem = getAll().find(s => s.uid === 'b');
        expect(replacedItem.status).toBe('done');
        expect(replacedItem.title).toBe('Updated Song');
        expect(songs.length).toBe(2);
    
        // Add a new item
        songs.replace({ uid: 'c', title: 'New Song' } as Song, getKey);
        const newItem = getAll().find(s => s.uid === 'c');
        expect(newItem.title).toBe('New Song');
        expect(songs.length).toBe(3);
    });

    it("should check if empty", () => {
        expect(songs.isEmpty).toBe(true);

        songs.push(demoSong);
        expect(songs.isEmpty).toBe(false);

        songs.set([]);
        expect(songs.isEmpty).toBe(true);
    });
});