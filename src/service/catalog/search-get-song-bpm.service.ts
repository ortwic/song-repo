import type { Artist, Song } from '../../model/song.model';
import type { SearchService } from './search.service';
import { showError } from '../../store/notification.store';
import { parseSearchQuery } from '../../utils/parse-search-query';
import { tryJson } from './search.service';

export type Mode = 'major' | 'minor';
export type ModeType = 'flat' | 'sharp';
type Genres = 'Blues' | 'Classical' | 'Country' | 'Electronic' | 'Folk' | ' Funk' | ' Heavy Meal' | 'Hip Hop' | ' Jazz' | ' Latin' | ' New Age' | ' Pop' | ' Punk' | ' R&B' | ' Rap' | ' Raggae' | ' Rock' | ' Soul' | ' World';

interface ArtistResult {
    id: string; // The GetSong ID for the artist.
    name: string; // The name of the artist.
    uri: string; // The GetSong URI for the artist.
    img: string; // Link to artist photo.
    genres: Genres[]; // Artist main genres.
    from: string; // Country or region/city of origin.
    mbid: string; // MusicBrainz ID.
}

interface SongResult {
    id: string; // The GetSong ID for the song.
    title: string; // The title of the song.
    uri: string; // The GetSong URI for the song.
    artist: ArtistResult; // See "artist" object.
    tempo: number; // Beat per minute of the song (BPM).
    time_sig: string; // Time signature (beta).
    key_of: string; // Original published key of the song.
    camelot?: string; // Name of the Key on the Camelot Wheel.
    album: Album;
}

interface BothResult {
    song_id: string; // The GetSong ID for the song.
    song_title: string; // The title of the song.
    song_uri: string; // The GetSong URI for the song.
    tempo: number; // Beat per minute of the song.
    time_sig: string; // Time signature (beta).
    key_of: string; // Original published key of the song.
    open_key: string; // Original published key of the song.
    camelot?: string; // Name of the Key on the Camelot Wheel.
    artist?: ArtistResult; // See "artist" object.
    album: Album;
}

interface Album {
    title: string; // Album name
    uri: string; // The GetSong URI for the album
    img: string; // Link to album cover art
    year: number // Release Year
}

export interface TempoResult {
    song_id: string; // The GetSong ID for the song.
    song_title: string; // The title of the song.
    song_uri: string; // The GetSong URI for the song.
    tempo: number; // Beat per minute of the song.
    artist: ArtistResult; // See "artist" object.
    album: Album; // Same keys and values as for "both" query type at /search/ endpoint.
}

export interface KeyResult {
    song_id: string; // The GetSong ID for the song.
    song_title: string; // The title of the song.
    song_uri: string; // The GetSong URI for the song.
    music_key: {
        raw: string; // input query
        key_of: string; // English name of the Key
        mode: Mode;
    };
    artist: ArtistResult; // See "artist" object.
    album: Album; // Same keys and values as for "both" query type at /search/ endpoint.
}

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