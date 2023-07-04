import { app } from './firebase.setup';
import {
    getFirestore,
    collection,
    query,
    where,
    orderBy,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    type DocumentData,
    type SetOptions
} from "firebase/firestore";
import { collectionData } from 'rxfire/firestore';
import { startWith } from 'rxjs/operators';
import type { Observable } from 'rxjs';

export default class FirestoreService {
    private db = getFirestore(app);

    constructor(public path: string) {        
    }

    public getDocuments(uid: string): Observable<DocumentData[]> {
        const items = collection(this.db, this.path);

        // Query requires an index, see screenshot below
        const q = query(items, where('uid', '==', uid), orderBy('createdAt'));        
        return collectionData(q, { idField: 'id' }).pipe(startWith([]));
    }
    
    public async setDocument(data: unknown, id?: string, options?: SetOptions): Promise<void> {
        const docRef = doc(this.db, this.path, id);
        await setDoc(docRef, data, options);
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
