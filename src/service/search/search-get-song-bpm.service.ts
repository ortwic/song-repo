import type { ArtistResult, SongResult, BothResult } from '../../model/songbpm.model';
import { showError } from '../../store/notification.store';
import { tryJson, type SearchService } from './search.service';

type Response<T> = { search: T[] };

export default class SearchSongBpmService implements SearchService {
    readonly baseUrl = 'https://api.getsong.co';
    readonly apiKey = import.meta.env.VITE_SONGBPM_API_KEY;

    async findArtists(artist: string): Promise<ArtistResult[]> {
        const url = `${this.baseUrl}/search/?api_key=${this.apiKey}&type=artist&lookup=${artist}`;
        const data = await fetch(url)
            .then((resp) => tryJson<Response<ArtistResult>>(resp, 'search'))
            .catch(error => showError(error));
        return Array.isArray(data) ? data : [];
    }

    async findSongs(title: string, artist?: string): Promise<SongResult[]> {
        return artist ? this.findBoth(title, artist) : this.findByTitleOnly(title);
    }
    
    private async findBoth(title: string, artist: string): Promise<SongResult[]> {
        const toSong = (item: BothResult) => ({
            ...item,
            id: item.song_id,
            title: item.song_title,
            uri: item.song_uri,
        } as SongResult);
        const url = `${this.baseUrl}/search/?api_key=${this.apiKey}&type=both&lookup=song:${title} artist:${artist}`;
        const data = await fetch(url)
            .then((resp) => tryJson<Response<BothResult>>(resp, 'search'))
            .catch(error => showError(error));
        return Array.isArray(data) ? data.map(toSong) : [];
    }

    private async findByTitleOnly(title: string): Promise<SongResult[]> {
        const url = `${this.baseUrl}/search/?api_key=${this.apiKey}&type=song&lookup=${title}`;
        const data = await fetch(url)
            .then((resp) => tryJson<Response<SongResult>>(resp, 'search'))
            .catch(error => showError(error));
        return Array.isArray(data) ? data : [];
    }
}
