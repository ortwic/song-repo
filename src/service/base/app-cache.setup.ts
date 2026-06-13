import { stores, type FirestoreService } from './firestore.service';
import type { Genre } from '../../model/song.model';

type Page = { id: string; title: string; body: string };

const cache = {
    genres: [] as Genre[],
    pages: [] as Page[]
};

type CacheRecord = typeof cache;
type CacheKey = keyof CacheRecord;

export async function initRefData(): Promise<void> {
    await Promise.all(
        (Object.keys(cache) as CacheKey[])
            .map(async (key) => (cache[key] as unknown[]) = await loadCollection(key))
    );
}

async function loadCollection<K extends CacheKey>(key: K): Promise<CacheRecord[K][]> {
    try {
        if (key in stores) {
            const service: FirestoreService = stores[key];
            return await service.getDocumentsAsync<CacheRecord[K]>();
        } else {
            console.warn(`No store for ${key}`);
        }
    } catch (err: unknown) {
        console.warn(`Unable to cache ${key}`, err);
    }
}

export const refData = new Proxy({} as CacheRecord, {
    get<K extends CacheKey>(_: CacheRecord, key: K): CacheRecord[K] {
        return cache[key];
    },
});
