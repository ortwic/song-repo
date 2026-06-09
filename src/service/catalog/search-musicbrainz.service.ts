import type { Artist,Song } from '../../model/song.model';
import type { SearchService } from './search.service';
import { showError } from '../../store/notification.store';
import { parseSearchQuery } from '../../utils/parse-search-query';

interface MbArtistCredit {
    name: string;
    artist: { id: string; name: string; 'sort-name': string; };
}

interface MbRelease {
    id: string;
    title: string;
}

interface MbRecording {
    id: string;
    title: string;
    'artist-credit'?: MbArtistCredit[];
    releases?: MbRelease[];
    tags?: { name: string; count: number }[]; 
}

interface MbArtist {
    id: string;
    name: string;
    country?: string;
    genres?: { name: string }[];
}

const BASE_URL = 'https://musicbrainz.org/ws/2';

function recordingToSong(recording: MbRecording): Song {
    const credit = recording['artist-credit']?.[0];
    // credit.name ist optional — nur gesetzt wenn abweichend vom artist.name
    const artistName = credit?.name ?? credit?.artist?.name ?? '';
    const primaryRelease = recording.releases?.[0];
    const topTag = recording.tags?.sort((a, b) => b.count - a.count)[0]?.name;

    return {
        id: recording.id,
        title: recording.title,
        artist: artistName,
        genre: topTag,
        source: primaryRelease
            ? `https://musicbrainz.org/release/${primaryRelease.id}`
            : `https://musicbrainz.org/recording/${recording.id}`,
    };
}

function mbArtistToArtist(a: MbArtist): Artist {
    return {
        id: a.id,
        name: a.name,
        uri: `https://musicbrainz.org/artist/${a.id}`,
        country: a.country
    };
}

export default class SearchMusicBrainzService implements SearchService {
    private readonly options: RequestInit;

    constructor(userAgent: string) {
        this.options = {
            // MusicBrainz requires a descriptive User-Agent
            headers: {
                Accept: 'application/json',
                'User-Agent': userAgent,
            },
        }
    }

    async findArtists(query: string): Promise<Artist[]> {
        const url = `${BASE_URL}/artist?query=${encodeURIComponent(query)}&fmt=json&limit=10`;
        const response = await fetch(url, this.options).catch(showError);
        if (!response) {
            return [];
        }

        const data = await response.json().catch(showError);
        return Array.isArray(data?.artists)
            ? data.artists.map(mbArtistToArtist)
            : [];
    }

    async findSongs(searchTerm: string): Promise<Song[]> {
        const { artist, title } = parseSearchQuery(searchTerm);
        // MusicBrainz Lucene syntax: Felder explizit benennen für verlässliche Treffer
        const query = artist
            ? `recording:"${title}" AND artist:"${artist}"`
            : `recording:"${title}"`;
        const url = `${BASE_URL}/recording?query=${encodeURIComponent(query)}&fmt=json&limit=10&inc=artist-credits+releases`;

        const response = await fetch(url, this.options).catch(showError);
        if (!response) {
            return [];
        }

        const data = await response.json().catch(showError);
        return Array.isArray(data?.recordings)
            ? data.recordings.map(recordingToSong)
            : [];
    }
}