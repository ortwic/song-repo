import type { Artist, Song } from '../../model/song.model';
import type { SearchService } from './search.service';
import { showError } from '../../store/notification.store';

const APP_NAME_PARAM = 'app_name=ocsoft42_songrepo';
const BASE_URL = 'https://discoveryprovider.audius.co/v1';

function toArtist(item: AudiusUser): Artist {
    return {
        id: item.id,
        name: item.name,
        uri: item.website,
        img: item.profile_picture?.['150x150'],
        country: item.location ?? '',
    };
}

function toSong(item: AudiusTrack): Song {
    return {
        id: item.id,
        title: item.title,
        artist: item.user?.name ?? '',
        artistImg: item.user?.profile_picture?.['150x150'],
        source: item.uri,
        genre: item.genre,
    };
}

interface AudiusUser {
    id: string;
    name: string;
    website?: string;
    profile_picture?: Record<string, string>;
    location?: string;
}

interface AudiusTrack {
    id: string;
    title: string;
    uri?: string;
    genre?: string;
    user: AudiusUser;
}

export default class SearchAudiusService implements SearchService {
    private readonly artistIdCache = new Map<string, string>();

    async findArtists(query: string): Promise<Artist[]> {
        const url = `${BASE_URL}/users/search?query=${encodeURIComponent(query)}&${APP_NAME_PARAM}`;
        const result = await fetch(url)
            .then((resp) => resp.json())
            .catch(showError);

        if (!Array.isArray(result?.data)) {
            return [];
        }

        return result.data.map((item: AudiusUser) => {
            this.artistIdCache.set(item.name, item.id);
            return toArtist(item);
        });
    }

    async findSongs(title: string, artist?: string): Promise<Song[]> {
        const url = artist && this.artistIdCache.has(artist)
            ? `${BASE_URL}/users/${this.artistIdCache.get(artist)}/tracks?query=${encodeURIComponent(title)}&${APP_NAME_PARAM}`
            : `${BASE_URL}/tracks/search?query=${encodeURIComponent(title)}&${APP_NAME_PARAM}`;

        const result = await fetch(url)
            .then((resp) => resp.json())
            .catch(showError);

        return Array.isArray(result?.data) ? result.data.map(toSong) : [];
    }
}