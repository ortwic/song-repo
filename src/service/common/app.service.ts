import { firstValueFrom, of } from 'rxjs';
import { catchError, filter, timeout } from 'rxjs/operators';
import { stores, type FirestoreService } from '../base/firestore.service';
import type { CalendarEvent, CalendarSettings } from '../../model/event.model';
import type { Genre } from '../../model/song.model';

type Page = { id: string; title: string; body: string };
type StoreTypes = {
    genres: Genre;
    pages: Page;
    events: CalendarEvent;
    settings: CalendarSettings;
};

type ReadonlyStoreKeys = keyof StoreTypes;

const readonlyStores: { [K in ReadonlyStoreKeys]: FirestoreService } = {
    genres: stores.genres,
    pages: stores.pages,
    events: stores.events,
    settings: stores.settings,
};

type RefCache = { [K in ReadonlyStoreKeys]: StoreTypes[K][] };
const cache = {} as RefCache;

async function loadCollection<T>(key: ReadonlyStoreKeys): Promise<T[]> {
    return firstValueFrom(
        readonlyStores[key].getDocuments<T>().pipe(
            filter((data) => data.length > 0),
            catchError(() => of([] as T[]))
        )
    );
}

export async function preloadRefData(): Promise<void> {
    await Promise.all(
        (Object.keys(readonlyStores) as ReadonlyStoreKeys[]).map(async (key) => {
            cache[key] = await loadCollection(key) as never;
        })
    );
}

export const refData = new Proxy({} as RefCache, {
    get<K extends ReadonlyStoreKeys>(_: RefCache, key: K): RefCache[K] {
        return cache[key];
    },
});