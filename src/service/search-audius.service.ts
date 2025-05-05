import type { ArtistResult, SongResult } from '../model/songbpm.model';
import { showError } from '../store/notification.store';
import type { ApiSettings } from '../model/types';
import type { SearchService } from './search.service';

export default class SearchAudiusService implements SearchService {
    baseUrl: string;
    apiKey: string;
    private artistIdMap = new Map<string, string>();

    constructor(settings: ApiSettings) {
        console.log(settings)
        this.baseUrl = settings.baseUrl;
        this.apiKey = settings.apiKey;
    }

    async findArtists(artist: string): Promise<ArtistResult[]> {
        const url = `${this.baseUrl}/users/search?query=${artist}`;
        const result = await fetch(url)
            .then(resp => resp.json())
            .catch(error => showError(error));
        if (!Array.isArray(result?.data)) {
            return [];
        }

        return result.data.map(item => {
            const artistResult: ArtistResult = {
                id: item.id,
                name: item.name,
                uri: item.website,
                img: item.profile_picture['150x150'],
                genres: [], // Add genre logic if needed
                from: item.location || '',
                mbid: '', // Not available in API response
            };
            this.artistIdMap.set(item.name, item.id);
            return artistResult;
        });
    }

    async findSongs(title: string, artist?: string): Promise<SongResult[]> {
        const toSong = (item) => {
            const songResult: SongResult = {
                id: item.id,
                title: item.title,
                uri: item.uri,
                artist: {
                    id: item.user.id,
                    name: item.user.name,
                    uri: item.website,
                    img: item.user.profile_picture['150x150'],
                    genres: [item.genre],
                    from: item.user.location || '',
                    mbid: '', // Not available in API response
                },
                tempo: 0, // Not provided in API response
                time_sig: '', // Not provided in API response
                key_of: '', // Not provided in API response
                album: {
                    title: '',
                    uri: '',
                    img: '',
                    year: 0
                }
            };
            return songResult;
        };

        if (this.artistIdMap.has(artist)) {
            const id = this.artistIdMap.get(artist);
            const url = `${this.baseUrl}/users/${id}/tracks?query=${title}`;
            const result = await fetch(url)
                .then(resp => resp.json())
                .catch(error => showError(error));
            return Array.isArray(result?.data) ? result.data.map(toSong) : [];
        }
        
        const url = `${this.baseUrl}/tracks/search?query=${title}`;
        const result = await fetch(url)
            .then(resp => resp.json())
            .catch(error => showError(error));
        return Array.isArray(result?.data) ? result.data.map(toSong) : [];
    }
}
