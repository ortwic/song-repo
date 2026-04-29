import type { User } from 'firebase/auth';
import { where } from 'firebase/firestore';
import { authState } from 'rxfire/auth';
import { from, map, Observable, of, startWith, switchMap } from 'rxjs';
import { auth } from './firebase.setup';
import FirestoreService, { uniqueKey } from './firestore.service';
import type { UserProfile } from '../model/user.model';

export const createUserStore = () => new FirestoreService('user');
const store = createUserStore();
const empty = { alias: '' } as UserProfile;

// Do not use currentUser here to avoid circular dependency
export const currentProfile = authState(auth).pipe(
    switchMap(({ uid }) => store.getDocument<UserProfile>(uid)),
    map(p => p || empty),
    startWith(empty)
);

export default class UserService {
    getProfileByAlias(alias: string): Observable<UserProfile> {
        return store.getDocuments<UserProfile>(where('alias', '==', alias)).pipe(
            switchMap(docs => docs.length ? of(docs[0]) : of({ alias } as UserProfile))
        );
    }

    isAliasAvailable(alias: string): Observable<boolean> {
        return from(store.getDocumentsAsync<UserProfile>(where('alias', '==', alias))).pipe(
            map(docs => docs.length === 0)
        );
    }

    async initProfile(user: User, provider?: string): Promise<void> {
        const existing = await store.getDocumentAsync<UserProfile>(user.uid);
        if (!existing?.email) {
            const alias = await this.resolveUniqueAlias(user);
            await store.setDocument({
                id: user.uid,
                name: user.displayName,
                photoURL: user.photoURL ?? undefined,
                email: user.email,
                alias,
                ...(provider && { provider }),
            }, { merge: true });
        }
    }

    private async resolveUniqueAlias(user: User): Promise<string> {
        const alias = uniqueKey(user.displayName ?? user.email.split('@')[0]);
        const docs = await store.getDocumentsAsync<UserProfile>(where('alias', '>=', alias), where('alias', '<', alias + '\uf8ff'));
        const existing = new Set(docs.map(d => d.alias));

        if (existing.has(alias))
        {
            let i = 2;
            while (existing.has(`${alias}${i}`)) i++;
            return `${alias}${i}`;
        }
        return alias;
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