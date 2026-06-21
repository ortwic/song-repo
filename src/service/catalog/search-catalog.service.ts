import { Index } from 'flexsearch';
import { refData } from '../base/app-cache.setup';
import { stores } from '../base/firestore.service';
import type { Artist, Genre, Song } from '../../model/song.model';
import type { SearchService } from './search.service';

let lazyArtistCatalog: Artist[] = null;
let lazySongCatalog: Song[] = null;
let lazySongIndex: Index = null;
let lazySongMap: Map<string, Song> = null;

function wordStartsWith(text: string, search: string): boolean {
    return search && text?.toLowerCase()
        .split(/\s+/)
        .some((v) => v.startsWith(search.toLowerCase()));
}

function getSongIndex(songs: Song[]) {
    if (!lazySongIndex) {
        lazySongIndex = buildSongIndex(songs);
        lazySongMap = new Map(songs.map((song) => [song.id, song]));
    }
    return { index: lazySongIndex, map: lazySongMap };
}

function buildSongIndex(songs: Song[]): Index {
    const index = new Index({
        tokenize: 'forward',
    });

    for (const song of songs) {
        index.add(song.id, [
            // weight title 3x
            ...Array(3).fill(song.title),
            // weight artist 2x
            ...Array(2).fill(song.artist),
            // weight genre
            song.genre ?? '',
            song.style ?? '',
        ].filter(Boolean).join(' '));
    }

    return index;
}

export default class SearchCatalogService implements SearchService {
    private readonly limit: number;

    constructor(options: { searchResultLimit: number }) {
        this.limit = options.searchResultLimit;
    }

    async findSongs(query: string): Promise<Song[]> {
        const songs = await this.getSongCatalog();
        const { index, map } = getSongIndex(songs);
        const results = index.search(query, { limit: this.limit });
        return results.map((id: string) => map.get(id))
            .filter((song): song is Song => Boolean(song));
    }

    async findArtists(text: string): Promise<Artist[]> {
        return (await this.getArtists())
            .filter((e) => wordStartsWith(e.names[0], text))
            .slice(0, this.limit);
    }

    private async getArtists(): Promise<Artist[]> {
        lazyArtistCatalog ??= await stores.artists.getDocumentsAsync<Artist>();
        return lazyArtistCatalog;
    }

    async findTitles(text: string, artistMbid?: string): Promise<Song[]> {
        return (await this.getSongCatalog())
            .filter((e) => !artistMbid || e.artistMbid === artistMbid && (!text || wordStartsWith(e.title, text)))
            .slice(0, this.limit);
    }

    private async getSongCatalog(): Promise<Song[]> {
        lazySongCatalog ??= await stores.catalog.getDocumentsAsync<Song>();
        return lazySongCatalog;
    }

    findGenres(text: string): Genre[] {
        return refData.genres.filter((e) => !text || wordStartsWith(e.name, text));
    }

    findStyles(text: string, genre: string): string[] {
        const styles = refData.genres.find((v) => v.name === genre)?.styles;
        return styles?.filter && styles.filter((e) => !text || wordStartsWith(e, text)) || [];
    }
}