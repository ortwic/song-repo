import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Song } from '../../model/song.model';
import SearchCatalogService from './search-catalog.service';

vi.mock('../base/firestore.service', () => ({
    stores: {
        catalog: { 
            getDocumentsAsync: vi.fn().mockResolvedValue([
                { id: '1', title: 'Autumn Leaves',      artist: 'Bill Evans',    genre: 'Jazz',      style: 'Cool Jazz' },
                { id: '2', title: 'So What',            artist: 'Miles Davis',   genre: 'Jazz',      style: 'Modal Jazz' },
                { id: '3', title: 'Bohemian Rhapsody',  artist: 'Queen',         genre: 'Rock',      style: 'Art Rock' },
                { id: '4', title: 'Stairway to Heaven', artist: 'Led Zeppelin',  genre: 'Rock',      style: 'Hard Rock' },
                { id: '5', title: 'Moonlight Sonata',   artist: 'Beethoven',     genre: 'Classical', style: 'Romantic' },
                { id: '6', title: 'Nocturne Op. 9',     artist: 'Chopin',        genre: 'Classical', style: 'Romantic' },
                { id: '7', title: 'Blue Bossa',         artist: 'Kenny Dorham',  genre: 'Jazz',      style: 'Bossa Nova' },
                { id: '8', title: 'Jazz Blues',         artist: 'Wes Montgomery', genre: 'Jazz',     style: 'Blues' },
            ]) 
        },
        artists: { 
            getDocumentsAsync: vi.fn().mockResolvedValue([
                { id: 'a1', names: ['Bill Evans'],      country: 'US' },
                { id: 'a2', names: ['Miles Davis'],     country: 'US' },
                { id: 'a3', names: ['Queen'],           country: 'GB' },
                { id: 'a4', names: ['Led Zeppelin'],    country: 'GB' },
                { id: 'a5', names: ['Beethoven'],       country: 'DE' },
                { id: 'a6', names: ['Chopin'],          country: 'PL' },
                { id: 'a7', names: ['Kenny Dorham'],    country: 'US' },
                { id: 'a8', names: ['Wes Montgomery'],  country: 'US' },
            ]) 
        }
    },
}));

vi.mock('../base/app-cache.setup', () => ({
    refData: {
        genres: [
            { name: 'Jazz',      styles: ['Cool Jazz', 'Modal Jazz', 'Bossa Nova', 'Blues'] },
            { name: 'Rock',      styles: ['Art Rock', 'Hard Rock'] },
            { name: 'Classical', styles: ['Romantic', 'Baroque'] },
        ],
    },
}));

function ids(songs: Song[]): string[] {
    return songs.map((s) => s.id);
}

// ------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------

describe('SearchCatalogService', () => {
    const service = new SearchCatalogService({ searchResultLimit: 20 });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('findSongs — title search', () => {
        it('finds a song by exact title', async () => {
            const results = await service.findSongs('Bohemian Rhapsody');

            expect(ids(results)).toContain('3');
        });

        it('finds a song by partial title prefix', async () => {
            const results = await service.findSongs('Autumn');

            expect(ids(results)).toContain('1');
        });

        it('ranks title matches above genre-only matches', async () => {
            // "Jazz Blues" has "Jazz" in the title; other songs only have it in genre
            const results = await service.findSongs('Jazz');
            const resultIds = ids(results);

            expect(resultIds.indexOf('8')).toBeLessThan(resultIds.indexOf('1'));
        });
    });

    describe('findSongs — artist search', () => {
        it('finds songs by artist name', async () => {
            const results = await service.findSongs('Miles Davis');

            expect(ids(results)).toContain('2');
        });

        it('finds songs by partial artist name', async () => {
            const results = await service.findSongs('Chopin');

            expect(ids(results)).toContain('6');
        });
    });

    describe('findSongs — genre search', () => {
        it('finds songs matching a genre', async () => {
            const results = await service.findSongs('Classical');
            const resultIds = ids(results);

            expect(resultIds).toContain('5');
            expect(resultIds).toContain('6');
        });

        it('finds songs matching a style', async () => {
            const results = await service.findSongs('Bossa Nova');

            expect(ids(results)).toContain('7');
        });
    });

    describe('findSongs — multi-field scoring', () => {
        it('ranks songs higher when they match multiple fields', async () => {
            // "Jazz Blues" matches "Jazz" in title AND genre — should outrank pure genre matches
            const results = await service.findSongs('Jazz');
            const resultIds = ids(results);

            expect(resultIds[0]).toBe('8');
        });

        it('respects SEARCH_LIMIT', async () => {
            const results = await service.findSongs('a'); // broad term

            expect(results.length).toBeLessThanOrEqual(10);
        });
    });

    describe('findSongs — no results', () => {
        it('returns empty array for unknown search term', async () => {
            const results = await service.findSongs('xyzzy');

            expect(results).toEqual([]);
        });
    });

    describe('findArtists', () => {
        it('finds an artist by exact name', async () => {
            const results = await service.findArtists('Chopin');

            expect(results.map((a) => a.id)).toContain('a6');
        });

        it('finds an artist by partial name prefix', async () => {
            const results = await service.findArtists('Miles');

            expect(results.map((a) => a.id)).toContain('a2');
        });

        it('finds multiple artists matching the same prefix', async () => {
            // "Bill Evans" and "Wes Montgomery" both contain no shared prefix —
            // but "B" matches Bill Evans and Beethoven
            const results = await service.findArtists('Be');

            expect(results.map((a) => a.id)).toContain('a5'); // Beethoven
        });

        it('returns empty array for unknown artist', async () => {
            const results = await service.findArtists('xyzzy');

            expect(results).toEqual([]);
        });

        it('respects searchResultLimit', async () => {
            const limitedService = new SearchCatalogService({ searchResultLimit: 2 });
            const results = await limitedService.findArtists('a');

            expect(results.length).toBeLessThanOrEqual(2);
        });
    });

    describe('findGenres', () => {
        it('finds a genre by exact name', async () => {
            const results = await service.findGenres('Jazz');

            expect(results.map((g) => g.name)).toContain('Jazz');
        });

        it('finds a genre by partial name prefix', async () => {
            const results = await service.findGenres('Clas');

            expect(results.map((g) => g.name)).toContain('Classical');
        });

        it('returns empty array for unknown genre', async () => {
            const results = await service.findGenres('xyzzy');

            expect(results).toEqual([]);
        });

        it('returns all matching genres for a broad prefix', async () => {
            // "R" matches Rock but not Jazz or Classical
            const results = await service.findGenres('R');

            expect(results.map((g) => g.name)).toContain('Rock');
            expect(results.map((g) => g.name)).not.toContain('Jazz');
        });
    });

    describe('findStyles', () => {
        it('finds styles within a genre', async () => {
            const results = await service.findStyles('Cool', 'Jazz');

            expect(results).toContain('Cool Jazz');
        });

        it('returns empty array if style does not match', async () => {
            const results = await service.findStyles('xyzzy', 'Jazz');

            expect(results).toEqual([]);
        });

        it('returns empty array for unknown genre', async () => {
            const results = await service.findStyles('Cool', 'Unknown');

            expect(results).toEqual([]);
        });

        it('finds styles by partial prefix', async () => {
            const results = await service.findStyles('Bossa', 'Jazz');

            expect(results).toContain('Bossa Nova');
        });
    });
});