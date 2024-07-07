import { app } from './firebase.setup';
import {
    getFirestore,
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

export const snapshotOptions: SnapshotOptions = {
    serverTimestamps: 'none'
};

export default class FirestoreService {
    private db = getFirestore(app);
    private options: { idField: string; };

    constructor(public path: string, idField?: string) {
        if (idField) {
            this.options = { idField };
        }
    }

    public getDocumentStream<T extends DocumentData>(...constraints: QueryConstraint[]): Observable<T[]> {
        const query = this.createQuery<T>(...constraints);
        return collectionData<T>(query, this.options).pipe(startWith([]));
    }
    
    public async getDocuments<T extends DocumentData>(...constraints: QueryConstraint[]): Promise<T[]> {
        const query = this.createQuery<T>(...constraints);
        return getDocs<T>(query).then((snapshot) => {
            const result: T[] = [];
            snapshot.forEach((doc) => result.push({
                id: doc.id,
                ...doc.data(snapshotOptions)
            }));
            return result;
        });
    }

    private createQuery<T extends DocumentData>(...constraints: QueryConstraint[]): Query<T> {
        const items = collection(this.db, this.path) as CollectionReference<T>;
        return query<T>(items, ...constraints);
    }

    public async getDocument<T>(id: string): Promise<T> {
        const docRef = doc(this.db, this.path, id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
            return snapshot.data(snapshotOptions) as T;
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

    public async setDeletedFlag(id: string): Promise<void> {
        const docRef = doc(this.db, this.path, id);
        await setDoc(docRef, { deleted: new Date() });
    }

    public async removeDocument(id: string): Promise<void> {
        const docRef = doc(this.db, this.path, id);
        await deleteDoc(docRef);
    }
}
