import type { ArtistResult, SongResult } from '../../model/songbpm.model';
import type { SearchEngines } from '../../model/types';
import SearchAudiusService from './search-audius.service';
import SearchSongBpmService from './search-get-song-bpm.service';

export interface SearchService {
    findArtists(artist: string): Promise<ArtistResult[]>;
    findSongs(title: string, artist?: string): Promise<SongResult[]>
}

export async function tryJson<T>(resp: Response, key: keyof T): Promise<T[keyof T]> {
    const text = await resp.text();
    if (text.startsWith('{') || text.startsWith('[')
        && text.endsWith('}') || text.endsWith(']')) {
        return JSON.parse(text)[key];
    }
    console.error(text);
    throw new Error('Failed to parse response. See console for details.');
}

export function createSearchService(engine: SearchEngines): SearchService {
    return engine === 'songbpm' 
        ? new SearchSongBpmService() 
        : new SearchAudiusService();
}

export abstract class AbstractSearchService {
    protected readonly options: RequestInit;

    constructor(apiKey: string, protected baseUrl: string) { 
        this.options = {
            method: 'GET',
            referrerPolicy: 'strict-origin-when-cross-origin',
            mode: 'cors',
            credentials: 'omit',
            headers: {
                Accept: 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json;charset=UTF-8',
                'User-Agent': navigator.userAgent
            }
        };
        if (apiKey) {
            this.options.headers['X-API-KEY'] = apiKey;
        }
    }

    abstract findArtists(artist: string): Promise<ArtistResult[]>;
    abstract findSongs(title: string, artist?: string): Promise<SongResult[]>;
}
