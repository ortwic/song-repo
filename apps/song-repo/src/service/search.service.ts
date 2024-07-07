import type { ArtistResult, SongResult, BothResult, TempoResult, KeyResult, Mode, ModeType } from '../model/songbpm.model';
import FirestoreService from './firestore.service';
import { showError } from '../store/notification.store';

const baseUrl = 'https://api.getsongbpm.com/';

export async function create() {
    const store = new FirestoreService('settings');
    const result = await store.getDocument('search')
        .then(resp => resp as Record<string, string>)
        .catch(error => showError(error));
    return new SearchService(result && result['song-repo']);
}

export default class SearchService {
    private readonly options: RequestInit;

    constructor(private apiKey: string) {
        this.options = {
            method: 'GET',
            referrerPolicy: 'strict-origin-when-cross-origin',
            mode: 'cors',
            credentials: 'omit',
            headers: {
                Accept: 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json;charset=UTF-8',
                'X-API-KEY': apiKey,
                'User-Agent': navigator.userAgent
            }
        };
    }

    async findArtists(artist: string): Promise<ArtistResult[]> {
        const url = `${baseUrl}/search/?api_key=${this.apiKey}&type=artist&lookup=${artist}`;
        const data = await fetch(url)
            .then(resp => resp.json())
            .catch(error => showError(error));
        return Array.isArray(data?.search) ? data.search : [];
    }

    async findSongs(title: string, artist?: string): Promise<SongResult[]> {
        const toSong = (item: SongResult | BothResult) => {
            return 'song_title' in item ? {
                ...item,
                id: item.song_id,
                title: item.song_title,
                uri: item.song_uri,
            } : item;
        };
        
        const search = artist 
            ? `type=both&lookup=song:${title} artist:${artist}` 
            : `type=song&lookup=${title}`;
        const url = `${baseUrl}/search/?api_key=${this.apiKey}&${search}`;
        const data = await fetch(url)
            .then(resp => resp.json())
            .catch(error => showError(error));
        return Array.isArray(data?.search) ? data.search.map(toSong) : [];
    }

    async searchByTempo(bpm: number, limit = 250): Promise<TempoResult[]> {
        if (bpm > 39 && bpm < 221) {
            const url = `${baseUrl}/tempo/?bpm=${bpm}&limit=${limit}`;
            const data = await fetch(url, this.options)
                .then(resp => resp.json())
                .catch(error => showError(error));
                
            console.log(limit, data);
            return data;
        }
    }

    async searchByKey(keyOf: number, mode: Mode, type: ModeType = 'sharp', limit = 250): Promise<KeyResult[]> {
        if (keyOf) {
            const url = `${baseUrl}/key/?key_of=${keyOf}&mode=${mode}&type=${type}&limit=${limit}`;
            const data = await fetch(url, this.options)
                .then(resp => resp.json())
                .catch(error => showError(error));
                
            console.log(limit, data);
            return data;
        }
    }

    async getArtist(id: string): Promise<ArtistResult> {
        if (id) {
            const url = `${baseUrl}/artist/?id=${id}`;
            const data = await fetch(url, this.options)
                .then(resp => resp.json())
                .catch(error => showError(error));
                
            console.log(id, data);
            return data;
        }
    }

    async getSong(id: string): Promise<SongResult> {
        if (id) {
            const url = `${baseUrl}/song/?id=${id}`;
            const data = await fetch(url, this.options)
                .then(resp => resp.json())
                .catch(error => showError(error));
                
            console.log(id, data);
            return data;
        }
    }
}
