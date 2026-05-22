import type { Artist, Song } from '../../model/song.model';
import type { SearchService } from './search.service';
import { showError } from '../../store/notification.store';

const BASE_URL = 'https://api.discogs.com/database/search';

interface DiscogsArtistResult {
    id: number;
    title: string;
    thumb?: string;
    uri?: string;
    country?: string;
}

interface DiscogsReleaseResult {
    id: number;
    title: string;
    thumb?: string;
    uri?: string;
    genre?: string[];
    style?: string[];
    year?: string;
    cover_image?: string;
    community?: { want: number; have: number };
}

interface DiscogsSearchResponse<T> {
    results: T[];
}

const DISCOGS_TITLE_SEPARATORS = [' \u2013 ', ' \u2014 ', ' - '] as const;

function splitDiscogsTitle(raw: string): { artist: string; title: string } {
    for (const separator of DISCOGS_TITLE_SEPARATORS) {
        const index = raw.indexOf(separator);
        if (index !== -1) {
            return {
                artist: raw.slice(0, index).trim(),
                title: raw.slice(index + separator.length).trim(),
            };
        }
    }
    return { artist: '', title: raw };
}

function releaseToSong(item: DiscogsReleaseResult): Song & { popularity: number } {
    const { artist, title } = splitDiscogsTitle(item.title);
    return {
        id: String(item.id),
        title,
        artist,
        artistImg: item.thumb,
        source: item.uri ? `https://www.discogs.com${item.uri}` : undefined,
        genre: item.genre?.[0],
        style: item.style?.join(', '),
        popularity: (item.community?.want ?? 0) + (item.community?.have ?? 0),
    };
}

function artistResultToArtist(item: DiscogsArtistResult): Artist {
    return {
        id: String(item.id),
        name: item.title,
        uri: item.uri ? `https://www.discogs.com${item.uri}` : undefined,
        img: item.thumb,
        country: item.country,
    };
}

export default class SearchDiscogsService implements SearchService {
    private readonly options: RequestInit;

    constructor(userAgent: string) {
        this.options = {
            headers: {
                Accept: 'application/json',
                'User-Agent': userAgent,
                Authorization: `Discogs key=${import.meta.env.VITE_DISCOGS_KEY}, secret=${import.meta.env.VITE_DISCOGS_SECRET}`,
            },
        }
    }

    async findArtists(query: string): Promise<Artist[]> {
        const url = `${BASE_URL}?type=artist&q=${encodeURIComponent(query)}&per_page=10`;
        const response = await fetch(url, this.options).catch(showError);
        if (!response) {
            return [];
        }

        const data: DiscogsSearchResponse<DiscogsArtistResult> = await response.json().catch(showError);
        return Array.isArray(data?.results) ? data.results.map(artistResultToArtist) : [];
    }

    async findSongs(title: string, artist?: string): Promise<Song[]> {
        const params = new URLSearchParams({
            type: 'master',
            release_title: title,
            per_page: '10',
        });
        if (artist) {
            params.set('artist', artist);
        }

        const url = `${BASE_URL}?${params}`;
        const response = await fetch(url, this.options).catch(showError);
        if (!response) {
            return [];
        }

        const data: DiscogsSearchResponse<DiscogsReleaseResult> = await response.json().catch(showError);
        return Array.isArray(data?.results) 
            ? data.results
                .map(releaseToSong)
                .sort((a, b) => b.popularity - a.popularity)
                .map(({ popularity, ...song }) => song) 
            : [];
    }
}