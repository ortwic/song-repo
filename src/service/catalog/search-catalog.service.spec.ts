import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Song } from '../../model/song.model';
import SearchCatalogService from './search-catalog.service';

vi.mock('../base/firestore.service', () => ({
    stores: {
        catalog: {
            getDocumentsAsync: vi.fn(),
        },
    },
}));

vi.mock('../../store/notification.store', () => ({
    showError: vi.fn(),
}));

import { stores } from '../base/firestore.service';

// ------------------------------------------------------------------
// Fixtures
// ------------------------------------------------------------------

const CATALOG: Song[] = [
    { id: '1', title: 'Autumn Leaves',      artist: 'Bill Evans',    genre: 'Jazz',      style: 'Cool Jazz' },
    { id: '2', title: 'So What',            artist: 'Miles Davis',   genre: 'Jazz',      style: 'Modal Jazz' },
    { id: '3', title: 'Bohemian Rhapsody',  artist: 'Queen',         genre: 'Rock',      style: 'Art Rock' },
    { id: '4', title: 'Stairway to Heaven', artist: 'Led Zeppelin',  genre: 'Rock',      style: 'Hard Rock' },
    { id: '5', title: 'Moonlight Sonata',   artist: 'Beethoven',     genre: 'Classical', style: 'Romantic' },
    { id: '6', title: 'Nocturne Op. 9',     artist: 'Chopin',        genre: 'Classical', style: 'Romantic' },
    { id: '7', title: 'Blue Bossa',         artist: 'Kenny Dorham',  genre: 'Jazz',      style: 'Bossa Nova' },
    { id: '8', title: 'Jazz Blues',         artist: 'Wes Montgomery', genre: 'Jazz',     style: 'Blues' },
];

function ids(songs: Song[]): string[] {
    return songs.map((s) => s.id);
}

// ------------------------------------------------------------------
// Setup
// ------------------------------------------------------------------

function createService(): SearchCatalogService {
    vi.mocked(stores.catalog.getDocumentsAsync).mockResolvedValue(CATALOG);
    return new SearchCatalogService();
}

// ------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------

describe('SearchCatalogService', () => {
    let service: SearchCatalogService;

    beforeEach(() => {
        vi.clearAllMocks();
        service = createService();
    });

    describe('catalog loading', () => {
        it('loads the catalog once on first findSongs call', async () => {
            await service.findSongs('Autumn');
            await service.findSongs('Miles');

            expect(stores.catalog.getDocumentsAsync).toHaveBeenCalledTimes(1);
        });

        it('returns empty array when catalog is empty', async () => {
            vi.mocked(stores.catalog.getDocumentsAsync).mockResolvedValue([]);
            const emptyService = new SearchCatalogService();

            const results = await emptyService.findSongs('Jazz');

            expect(results).toEqual([]);
        });

        it('retries loading after a failed attempt', async () => {
            vi.mocked(stores.catalog.getDocumentsAsync)
                .mockRejectedValueOnce(new Error('Network error'))
                .mockResolvedValueOnce(CATALOG);

            await expect(service.findSongs('Jazz')).rejects.toThrow('Network error');
            const results = await service.findSongs('Jazz');

            expect(results.length).toBeGreaterThan(0);
            expect(stores.catalog.getDocumentsAsync).toHaveBeenCalledTimes(2);
        });
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
});