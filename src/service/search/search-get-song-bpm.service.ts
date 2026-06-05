import type { ArtistResult, SongResult, BothResult } from '../../model/songbpm.model';
import type { Artist, Song } from '../../model/song.model';
import type { SearchService } from './search.service';
import { showError } from '../../store/notification.store';
import { parseSearchQuery } from '../../utils/parse-search-query';
import { tryJson } from './search.service';

type ApiResponse<T> = { search: T[] };

function artistResultToArtist(a: ArtistResult): Artist {
    return {
        id: a.id,
        name: a.name,
        uri: a.uri,
        img: a.img,
        country: a.from
    };
}

function songResultToSong(s: SongResult): Song {
    return {
        id: s.id,
        title: s.title,
        artist: s.artist?.name ?? '',
        source: s.uri,
        genre: s.artist?.genres?.[0],
        key: s.key_of,
        bpm: s.tempo,
    };
}

function bothResultToSong(item: BothResult): Song {
    return {
        id: item.song_id,
        title: item.song_title,
        artist: item.artist?.name ?? '',
        source: item.song_uri,
        key: item.key_of,
        bpm: item.tempo,
    };
}

export default class SearchSongBpmService implements SearchService {
    private readonly baseUrl = 'https://api.getsong.co';
    private readonly apiKey = import.meta.env.VITE_SONGBPM_API_KEY;

    async findArtists(query: string): Promise<Artist[]> {
        const url = `${this.baseUrl}/search/?api_key=${this.apiKey}&type=artist&lookup=${encodeURIComponent(query)}`;
        const data = await fetch(url)
            .then((resp) => tryJson<ApiResponse<ArtistResult>>(resp, 'search'))
            .catch(showError);
        return Array.isArray(data) ? data.map(artistResultToArtist) : [];
    }

    async findSongs(searchTerm: string): Promise<Song[]> {
        const { artist, title } = parseSearchQuery(searchTerm);
        return artist
            ? this.findBoth(title, artist)
            : this.findByTitleOnly(title);
    }

    private async findBoth(title: string, artist: string): Promise<Song[]> {
        const url = `${this.baseUrl}/search/?api_key=${this.apiKey}&type=both&lookup=song:${encodeURIComponent(title)} artist:${encodeURIComponent(artist)}`;
        const data = await fetch(url)
            .then((resp) => tryJson<ApiResponse<BothResult>>(resp, 'search'))
            .catch(showError);
        return Array.isArray(data) ? data.map(bothResultToSong) : [];
    }

    private async findByTitleOnly(title: string): Promise<Song[]> {
        const url = `${this.baseUrl}/search/?api_key=${this.apiKey}&type=song&lookup=${encodeURIComponent(title)}`;
        const data = await fetch(url)
            .then((resp) => tryJson<ApiResponse<SongResult>>(resp, 'search'))
            .catch(showError);
        return Array.isArray(data) ? data.map(songResultToSong) : [];
    }
}