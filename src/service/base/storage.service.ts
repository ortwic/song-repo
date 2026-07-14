import type { StorageReference } from "firebase/storage";
import { ref, listAll, getDownloadURL, uploadBytes, deleteObject, getStorage } from "firebase/storage";
import { BehaviorSubject, catchError, from, map, Observable, of, Subscription } from "rxjs";
import { app } from "./firebase.setup";
import { showError } from "../../store/notification.store";

export type StorageItem = {
    type: 'folder' | 'file' | 'virtual';
    name: string;
    bucket: string;
    path: string;
    parent: StorageItem;
};

export type StorageFile = StorageItem & {
    url: string;
};

const dummyFile = { name: '.init' } as File;

function toStorageItem(ref: StorageReference | null, type: 'folder' | 'file'): StorageItem {
    return ref ? {
        type,
        name: ref.name,
        bucket: ref.bucket,
        path: ref.fullPath,
        parent: toStorageItem(ref.parent, 'folder')
    } : { } as StorageItem;
}

export class StorageService {
    private readonly itemSubject = new BehaviorSubject<StorageItem[]>([]);
    private currentFolder = '';
    private currentSub: Subscription | null = null;
    readonly items$ = this.itemSubject.asObservable();
    readonly storage = getStorage(app);

    listAll(path: string): Observable<StorageItem[]> {
        const desc = <T extends StorageItem>(a: T, b: T) => b.type.localeCompare(a.type);
        if (this.storage) {
            this.currentFolder = path;
            this.currentSub?.unsubscribe();
            
            this.currentSub = from(listAll(ref(this.storage, path))).pipe(
                map((result) => ([
                    ...result.prefixes.map(i => toStorageItem(i, 'folder')),
                    ...result.items
                        .filter(i => i.name !== dummyFile.name)
                        .map(i => toStorageItem(i, 'file'))
                ])),
                map((items) => items.toSorted(desc)),
                catchError((err) => {
                    showError(err.message);
                    return of([]);
                })
            ).subscribe(items => this.itemSubject.next(items));
        }
        return this.items$;
    }

    private reload() {
        return this.listAll(this.currentFolder);
    }

    async getFileUrl(path: string): Promise<string> {
        if (this.storage && path) {
            const fileRef = ref(this.storage, path);
            return await getDownloadURL(fileRef);
        }
        return "";
    }

    async createFolder(path: string, name: string) {
        if (this.storage) {
            const fileRef = ref(this.storage, `${path}/${name}/${dummyFile.name}`);
            try {
                const snapshot = await uploadBytes(fileRef, dummyFile);
                const folder: StorageItem = { 
                    name, 
                    type: 'folder',
                    path: `${path}/${name}`,
                    parent: { path, type: 'folder' } as StorageItem, 
                    bucket: snapshot.ref.bucket
                };
                this.reload();
            } catch (error: any) {
                showError(error.message);
            }
        }
    }

    async uploadFile(path: string, file: File): Promise<StorageItem | null> {
        if (this.storage) {
            const fileRef = ref(this.storage, `${path}/${file.name}`);
            try {
                const snapshot = await uploadBytes(fileRef, file);
                const item = toStorageItem(snapshot.ref, 'file');
                this.reload();
                return item;
            } catch (error: any) {
                showError(error.message);
            }
        }
        return null;
    }

    async deleteFile(path: string): Promise<void> {
        if (this.storage) {
            const fileRef = ref(this.storage, path);
            try {
                await deleteObject(fileRef);
                this.reload();
            } catch (error: any) {
                showError(error.message);
            }
        }
    }
}
