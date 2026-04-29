import { from, type Observable } from 'rxjs';
import type { ArtistResult, SongResult } from '../model/songbpm.model';
import type { SearchEngines, ApiSettings, SearchSettings } from '../model/types';
import { showError } from '../store/notification.store';
import FirestoreService from './firestore.service';
import SearchAudiusService from './search-audius.service';
import SearchSongBpmService from './search-get-song-bpm.service';
import { readable, type Readable } from 'svelte/store';

export interface SearchService {
    findArtists(artist: string): Promise<ArtistResult[]>;
    findSongs(title: string, artist?: string): Promise<SongResult[]>
}

function observableToStore<T>(observable: Observable<T>, initialValue: T): Readable<T> {
    return readable<T>(initialValue, set => {
        const subscription = observable.subscribe(set);
        return () => subscription.unsubscribe();
    });
}

export const settingsStore = observableToStore(from(loadSettings()), {} as SearchSettings);

async function loadSettings() {
    const store = new FirestoreService('settings');
    return store.getDocumentAsync<SearchSettings>('search')
        .catch(error => showError(error));
}

export function create(engine: SearchEngines, settings?: ApiSettings): SearchService {
    const empty = { apiKey: '', baseUrl: '' };
    return engine === 'songbpm' 
        ? new SearchSongBpmService(settings || empty) 
        : new SearchAudiusService(settings || empty);
}

export async function createAsync(engine: SearchEngines): Promise<SearchService> {
    const empty = { apiKey: '', baseUrl: '' };
    const store = new FirestoreService('settings');
    const settings = await store.getDocumentAsync<Record<SearchEngines, ApiSettings>>('search')
        .then(data => data[engine])
        .catch(error => showError(error));

    return engine === 'songbpm' 
        ? new SearchSongBpmService(settings || empty) 
        : new SearchAudiusService(settings || empty);
}

export abstract class AbstractSearchService {
    protected readonly options: RequestInit;

    get apiKey() { return this.settings.apiKey; }
    
    get baseUrl() { return this.settings.baseUrl; }

    constructor(private settings: ApiSettings) { 
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
        if (settings.apiKey) {
            this.options.headers['X-API-KEY'] = settings.apiKey;
        }
    }

    abstract findArtists(artist: string): Promise<ArtistResult[]>;
    abstract findSongs(title: string, artist?: string): Promise<SongResult[]>;
}
