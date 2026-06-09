import { Document as FlexDocument } from 'flexsearch';
import type { Artist, Song } from '../../model/song.model';
import type { SearchService } from './search.service';
import { stores } from '../base/firestore.service';
import { showError } from '../../store/notification.store';

const SEARCH_LIMIT = 20;

type IndexedSong = Pick<Song, 'id' | 'title' | 'artist' | 'genre' | 'style'>;

type IndexedField = keyof Omit<IndexedSong, 'id'>;

const FIELD_WEIGHTS: Record<IndexedField, number> = {
    title: 9,
    artist: 7,
    genre: 5,
    style: 4,
};

function buildIndex(songs: Song[]): FlexDocument<IndexedSong> {
    const index = new FlexDocument<IndexedSong>({
        document: {
            id: 'id',
            index: [
                { field: 'title',  tokenize: 'forward', resolution: 9 },
                { field: 'artist', tokenize: 'forward', resolution: 7 },
                { field: 'genre',  tokenize: 'full',    resolution: 5 },
                { field: 'style',  tokenize: 'full',    resolution: 4 },
            ],
        },
    });

    for (const song of songs) {
        index.add({
            id: song.id,
            title: song.title,
            artist: song.artist,
            genre: song.genre,
            style: song.style,
        });
    }

    return index;
}

function deduplicateByArtist(songs: Song[]): Artist[] {
    const seen = new Set<string>();
    const artists: Artist[] = [];

    for (const song of songs) {
        if (!seen.has(song.artist)) {
            seen.add(song.artist);
            artists.push({ id: song.artist, name: song.artist });
        }
    }

    return artists;
}

export default class SearchCatalogService implements SearchService {
    private readonly limit: number;
    private catalog: Song[] = [];
    private index: FlexDocument<IndexedSong> | null = null;
    private loadPromise: Promise<void> | null = null;

    constructor(options: {
        searchResultLimit: number
    }) {
        this.limit = options.searchResultLimit;
    }

    async findArtists(query: string): Promise<Artist[]> {
        await this.ensureLoaded();

        if (!this.index) {
            return [];
        }

        const results = this.index.search(query, { field: 'artist', limit: this.limit });
        const matchingIds = new Set<string>(results.flatMap((r) => r.result as string[]));
        const matchingSongs = this.catalog.filter((song) => matchingIds.has(song.id));

        return deduplicateByArtist(matchingSongs);
    }

    async findSongs(searchTerm: string): Promise<Song[]> {
        await this.ensureLoaded();
        return this.searchIndex(searchTerm);
    }

    private ensureLoaded(): Promise<void> {
        if (!this.loadPromise) {
            this.loadPromise = this.loadCatalog().catch((error) => {
                this.loadPromise = null;
                showError(error);
                throw error;
            });
        }

        return this.loadPromise;
    }

    private async loadCatalog(): Promise<void> {
        this.catalog = await stores.catalog.getDocumentsAsync<Song>();
        this.index = buildIndex(this.catalog);
    }

    private searchIndex(query: string): Song[] {
        if (!this.index) {
            return [];
        }

        const hits = [
            ...this.searchField('title',  query),
            ...this.searchField('artist', query),
            ...this.searchField('genre',  query),
            ...this.searchField('style',  query),
        ];

        // Accumulate scores — a song matching multiple fields ranks higher
        const scores = new Map<string, number>();
        for (const [id, score] of hits) {
            scores.set(id, (scores.get(id) ?? 0) + score);
        }

        return [...scores.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, SEARCH_LIMIT)
            .map(([id]) => this.catalog.find((s) => s.id === id)!);
    }

    private searchField(field: IndexedField, query: string): [string, number][] {
        const weight = FIELD_WEIGHTS[field];
        const results = this.index!.search(query, { field, limit: SEARCH_LIMIT * 2 });

        // Position within results slightly downgrades score (first hit = full weight)
        return results.flatMap((r) =>
            (r.result as string[]).map((id, i) => [id, weight - i * 0.1] as [string, number]),
        );
    }
}