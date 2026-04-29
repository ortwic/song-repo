import type { ArtistResult, SongResult, BothResult } from '../model/songbpm.model';
import { showError } from '../store/notification.store';
import type { ApiSettings } from '../model/types';
import type { SearchService } from './search.service';

export default class SearchSongBpmService implements SearchService {
    baseUrl: string;
    apiKey: string;

    constructor(settings: ApiSettings) {
        this.baseUrl = settings.baseUrl;
        this.apiKey = settings.apiKey;
    }

    async findArtists(artist: string): Promise<ArtistResult[]> {
        const url = `${this.baseUrl}/search/?api_key=${this.apiKey}&type=artist&lookup=${artist}`;
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
        const url = `${this.baseUrl}/search/?api_key=${this.apiKey}&${search}`;
        const data = await fetch(url)
            .then(resp => resp.json())
            .catch(error => showError(error));
        return Array.isArray(data?.search) ? data.search.map(toSong) : [];
    }
}
