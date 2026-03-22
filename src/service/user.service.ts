import { from, map, Observable, of, startWith, switchMap } from 'rxjs';
import FirestoreService from './firestore.service';
import type { UserProfile } from '../model/user.model';
import { currentUser } from './auth.service';
import { where } from 'firebase/firestore';

export const createUserStore = () => new FirestoreService('user');
const store = createUserStore();

export const currentProfile = currentUser.pipe(
    switchMap(({ uid }) => from(store.getDocument<UserProfile>(uid))),
    startWith({ alias: '' } as UserProfile)
);

export default class UserService {
    getProfileByAlias(alias: string): Observable<UserProfile> {
        return store.getDocumentStream<UserProfile>(where('alias', '==', alias)).pipe(
            switchMap(docs => docs.length ? of(docs[0]) : of({ alias } as UserProfile))
        );
    }

    isAliasAvailable(alias: string): Observable<boolean> {
        return from(store.getDocuments<UserProfile>(where('alias', '==', alias))).pipe(
            map(docs => docs.length === 0)
        );
    }

    async updateProfile(data: Partial<UserProfile> & { id: string }): Promise<void> {
        await store.setDocument(data, { merge: true });
    }

    async setAlias(id: string, alias: string): Promise<void> {
        await store.setDocument({ id, alias }, { merge: true });
    }

    async setDeletedFlag(id: string): Promise<void> {
        await store.setDocument({ id, deleted: new Date() });
    }
}