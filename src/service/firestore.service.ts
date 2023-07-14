import { app } from './firebase.setup';
import {
    getFirestore,
    collection,
    query,
    where,
    orderBy,
    doc,
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

export default class FirestoreService {
    private db = getFirestore(app);

    constructor(public path: string, ...constraints: QueryConstraint[]) {}

    public getDocuments<T>(uid: string, ...constraints: QueryConstraint[]): Observable<T[]> {
        const items = collection(this.db, this.path) as CollectionReference<T>;

        // Query requires an index, see screenshot below
        const q = query<T>(items, where('uid', '==', uid), orderBy('id'), ...constraints);
        return collectionData<T>(q, { idField: 'id' }).pipe(startWith([]));
    }

    public async setDocument<T extends { id: string }>(
        data: T,
        options?: SetOptions
    ): Promise<void> {
        const docRef = doc(this.db, this.path, data.id);
        await setDoc(docRef, omitUndefinedFields(data), options);
    }

    public async setDocuments<T extends { id: string }>(
        array: T[],
        options?: SetOptions
    ): Promise<void> {
        const batch = writeBatch(this.db);
        array.forEach((data) => {
            const docRef = doc(this.db, this.path, data.id);
            batch.set(docRef, omitUndefinedFields(data), options);
        });
        await batch.commit();
    }

    public async updateDocument(
        data: Partial<unknown>,
        id: string
    ): Promise<void> {
        const docRef = doc(this.db, this.path, id);
        await updateDoc(docRef, data);
    }

    public async removeDocument(id: string): Promise<void> {
        const docRef = doc(this.db, this.path, id);
        await deleteDoc(docRef);
    }
}
