import type { Artist, Song } from '../../model/song.model';
import type { SearchEngines } from '../../model/types';
import SearchAudiusService from './search-audius.service';
import SearchDiscogsService from './search-discogs.service';
import SearchMusicBrainzService from './search-musicbrainz.service';
import SearchSongBpmService from './search-get-song-bpm.service';
import pkg from '../../../package.json'
import SearchCatalogService from './search-catalog.service';

export interface SearchService {
    findArtists(artist: string): Promise<Artist[]>;
    findSongs(searchTerm: string): Promise<Song[]>
}

export async function tryJson<T>(resp: Response, key: keyof T): Promise<T[keyof T]> {
    const text = await resp.text();
    if (text.startsWith('{') || text.startsWith('[')
        && text.endsWith('}') || text.endsWith(']')) {
        return JSON.parse(text)[key];
    }
    console.error(text);
    throw new Error('Failed to parse response. See console for details.');
}

export function createSearchService(engine?: SearchEngines | undefined): SearchService {
    const userAgent = `song-repo/${import.meta.env.PACKAGE_VERSION} (${pkg.homepage})`;
    switch  (engine) {
        case 'songbpm':
            return new SearchSongBpmService();
        case 'audius':
            return new SearchAudiusService();
        case 'discogs':
            return new SearchDiscogsService(userAgent);
        case 'musicbrainz':
            return new SearchMusicBrainzService(userAgent);
        default:
            return new SearchCatalogService({
                searchResultLimit: 20
            });
    }
}
