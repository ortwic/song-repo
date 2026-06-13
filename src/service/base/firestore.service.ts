import { initFirestore } from './firebase.setup';
import {
    collection,
    query,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    writeBatch,
    type DocumentData,
    type SetOptions,
    type SnapshotOptions,
    CollectionReference,
    QueryConstraint,
    Query,
} from 'firebase/firestore';
import { collectionData, docData } from 'rxfire/firestore';
import { startWith } from 'rxjs/operators';
import { of, type Observable } from 'rxjs';

const store = initFirestore();

// firestore does not like undefined values so omit them
const omitUndefinedFields = (data: object) => {
    Object.keys(data).forEach((key) => {
        if (data[key] === undefined) {
            delete data[key];
        }
    });
    return data;
};
export const uniqueKey = (...array: string[]) => array.join('').trim().replaceAll(/\W/g, '');

export const snapshotOptions: SnapshotOptions = {
    serverTimestamps: 'none'
};

export class FirestoreService {
    private constructor(
        private readonly path: string, 
        private readonly options = { idField: 'id' }
    ) {
    }

    static create(...pathSegments: string[]): FirestoreService {
        const path = pathSegments.length % 2 > 0 ? pathSegments.join('/') : '';
        return new FirestoreService(path);
    }

    public getDocuments<T extends DocumentData>(...constraints: QueryConstraint[]): Observable<T[]> {
        if (this.path) {
            const query = this.createQuery<T>(constraints);
            return collectionData<T>(query, this.options).pipe(startWith([]));
        }
        return of([]);
    }
    
    public async getDocumentsAsync<T extends DocumentData>(...constraints: QueryConstraint[]): Promise<T[]> {
        if (this.path) {
            const query = this.createQuery<T>(constraints);
            return getDocs<T>(query).then((snapshot) => {
                const result: T[] = [];
                snapshot.forEach((doc) => result.push({
                    id: doc.id,
                    ...doc.data(snapshotOptions)
                }));
                return result;
            });
        }
        return [];
    }

    private createQuery<T extends DocumentData>(constraints: QueryConstraint[]): Query<T> {
        const items = collection(store, this.path) as CollectionReference<T>;
        return query<T>(items, ...constraints);
    }
    
    public getDocument<T>(id: string): Observable<T | null> {
        if (id && this.path) {
            const docRef = doc(store, this.path, id);
            return docData(docRef, { idField: 'id' }) as Observable<T | null>;
        }
        return of(null);
    }

    public async getDocumentAsync<T>(id: string): Promise<T | null> {
        if (id && this.path) {
            const docRef = doc(store, this.path, id);
            const snapshot = await getDoc(docRef);
            if (snapshot.exists()) {
                return snapshot.data(snapshotOptions) as T;
            }
        }
        return Promise.resolve(null);
    }

    public async setDocument<T extends { id: string }>(data: T, options?: SetOptions): Promise<void> {
        if (this.path && data.id) {
            const docRef = doc(store, this.path, data.id);
            await setDoc(docRef, omitUndefinedFields(data), options);
        }
    }

    public async setDocuments<T extends { id: string }>(array: T[], options?: SetOptions): Promise<void> {
        if (this.path) {
            const batch = writeBatch(store);
            array.forEach((data) => {
                const docRef = doc(store, this.path, data.id);
                batch.set(docRef, omitUndefinedFields(data), options);
            });
            await batch.commit();
        }
    }

    public async updateDocument(data: Partial<unknown>, id: string): Promise<void> {
        if (this.path && id) {
            const docRef = doc(store, this.path, id);
            await updateDoc(docRef, data);
        }
    }

    public async removeDocument(id: string): Promise<void> {
        if (this.path && id) {
            const docRef = doc(store, this.path, id);
            await deleteDoc(docRef);
        }
    }
}

export const stores = {
    artists: FirestoreService.create('artists'),
    blog: FirestoreService.create('blog'),
    catalog: FirestoreService.create('songcatalog'),
    events: FirestoreService.create('events'),
    feedback: FirestoreService.create('feedback'),
    genres: FirestoreService.create('genres'),
    pages: FirestoreService.create('pages'),
    settings: FirestoreService.create('settings'),
    user: FirestoreService.create('user'),
    userlinks: (id: string) => FirestoreService.create('user', id, 'links'),
    usersongs: (id: string) => FirestoreService.create('user', id, 'songs'),
};
