import { stores, type FirestoreService } from '../base/firestore.service';
import type { CalendarEvent, CalendarSettings } from '../../model/event.model';
import type { Artist, Genre, Song } from '../../model/song.model';

type Page = { id: string; title: string; body: string };

const cache = {
    artists: [] as Artist[],
    catalog: [] as Song[],
    genres: [] as Genre[],
    pages: [] as Page[],
    events: [] as CalendarEvent[],
    settings: [] as CalendarSettings[],
} as const;
type CacheRecord = typeof cache;
type CacheKey = keyof CacheRecord;

export async function preloadRefData(): Promise<void> {
    await Promise.all(
        (Object.entries(cache)).map(async ([key]) => {
            try {
                if (key in stores) {    
                    const service: FirestoreService = stores[key];
                    cache[key] = await service.getDocumentsAsync<CacheRecord[CacheKey]>();
                } else {
                    console.warn(`No store for ${key}`);
                }
            } catch (err: unknown) {
                console.warn(`Unable to cache ${key}`, err);
            }
        })
    );
}

type RefCache = { [K in CacheKey]: CacheRecord[K] };
export const refData = new Proxy({} as RefCache, {
    get<K extends CacheKey>(_: RefCache, key: K): RefCache[K] {
        return cache[key];
    },
});
