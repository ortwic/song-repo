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
    type DocumentData
} from "firebase/firestore";
import { collectionData } from 'rxfire/firestore';
import { startWith } from 'rxjs/operators';
import type { Song } from '../model/song.model';
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

    public async addDocument(song: Song): Promise<void> {
        const docRef = doc(collection(this.db, this.path));
        await setDoc(docRef, song);
    }
    
    public async updateDocument(id: string, song: Partial<Song>): Promise<void> {
        const docRef = doc(this.db, this.path, id);
        await updateDoc(docRef, song);
    }
    
    public async removeDocument(id: string): Promise<void> {
        const docRef = doc(this.db, this.path, id);
        await deleteDoc(docRef);
    }
}
