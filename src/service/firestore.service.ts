import { app } from './firebase.setup';
import {
    getFirestore,
    collection,
    query,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    writeBatch,
    type SetOptions,
    CollectionReference,
    QueryConstraint,
} from 'firebase/firestore';
import { collectionData } from 'rxfire/firestore';
import { startWith } from 'rxjs/operators';
import type { Observable } from 'rxjs';

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

export default class FirestoreService {
    private db = getFirestore(app);
    private options: { idField: string; };

    constructor(public path: string, idField?: string) {
        if (idField) {
            this.options = { idField };
        }
    }

    public getDocuments<T>(...constraints: QueryConstraint[]): Observable<T[]> {
        const items = collection(this.db, this.path) as CollectionReference<T>;

        // Query requires an index, see screenshot below
        const q = query<T>(items, ...constraints);
        return collectionData<T>(q, this.options).pipe(startWith([]));
    }

    public async getDocument<T>(id: string): Promise<T> {
        const docRef = doc(this.db, this.path, id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
            return snapshot.data({ serverTimestamps: 'none' }) as T;
        }
        
        return Promise.resolve(undefined);
    }

    public async setDocument<T extends { id: string }>(data: T, options?: SetOptions): Promise<void> {
        const docRef = doc(this.db, this.path, data.id);
        await setDoc(docRef, omitUndefinedFields(data), options);
    }

    public async setDocuments<T extends { id: string }>(array: T[], options?: SetOptions): Promise<void> {
        const batch = writeBatch(this.db);
        array.forEach((data) => {
            const docRef = doc(this.db, this.path, data.id);
            batch.set(docRef, omitUndefinedFields(data), options);
        });
        await batch.commit();
    }

    public async updateDocument(data: Partial<unknown>, id: string): Promise<void> {
        const docRef = doc(this.db, this.path, id);
        await updateDoc(docRef, data);
    }

    public async removeDocument(id: string): Promise<void> {
        const docRef = doc(this.db, this.path, id);
        await deleteDoc(docRef);
    }
}
