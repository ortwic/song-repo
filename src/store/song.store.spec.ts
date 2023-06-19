import { describe, it, expect } from 'vitest';
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
    it("should push an item", () => {
        songs.push(demoSong);
        expect(songs.isEmpty).toBe(false);
    });

    it("should set empty", () => {
        songs.set([]);
        expect(songs.isEmpty).toBe(true);
    });

    it("should pop an item from the store", () => {
        expect(songs.isEmpty).toBe(true);
        songs.push(demoSong);

        expect(songs.pop()).toBe(demoSong);
        expect(songs.isEmpty).toBe(true);

        expect(songs.pop()).toBeUndefined();
        expect(songs.isEmpty).toBe(true);
    });

    it("should check if empty", () => {
        expect(songs.isEmpty).toBe(true);

        songs.push(demoSong);
        expect(songs.isEmpty).toBe(false);

        songs.set([]);
        expect(songs.isEmpty).toBe(true);
    });
});