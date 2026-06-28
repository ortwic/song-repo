import { GoogleAuthProvider, type User } from 'firebase/auth';
import { where } from 'firebase/firestore';
import { authState } from 'rxfire/auth';
import { from, map, Observable, of, startWith, switchMap } from 'rxjs';
import { auth } from '../base/firebase.setup';
import { stores } from '../base/firestore.service';
import type { UserProfile } from '../../model/user.model';
import { docId } from '../../utils/object.helper';

const empty = { alias: '' } as UserProfile;

// Do not use currentUser here to avoid circular dependency
export const currentProfile = authState(auth).pipe(
    switchMap((p) => stores.user.getDocument<UserProfile>(p?.uid)),
    map(p => p || empty),
    startWith(empty)
);

export const isGoogleUser = currentProfile.pipe(map(p => p?.provider === GoogleAuthProvider.PROVIDER_ID));

export default class UserService {
    getProfileByAlias(alias: string): Observable<UserProfile> {
        return stores.user.getDocuments<UserProfile>(where('alias', '==', alias)).pipe(
            switchMap(docs => docs.length ? of(docs[0]) : of({ alias } as UserProfile))
        );
    }

    isAliasAvailable(alias: string): Observable<boolean> {
        return from(stores.user.getDocumentsAsync<UserProfile>(where('alias', '==', alias))).pipe(
            map(docs => docs.length === 0)
        );
    }

    async initProfile(user: User, provider?: string): Promise<void> {
        const existing = await stores.user.getDocumentAsync<UserProfile>(user.uid);
        if (!existing?.email) {
            const alias = await this.resolveUniqueAlias(user);
            await stores.user.setDocument({
                id: user.uid,
                created: new Date(),
                deleted: null,
                name: user.displayName,
                photoURL: user.photoURL ?? undefined,
                email: user.email,
                alias,
                ...(provider && { provider }),
            } as UserProfile, { merge: true });
        }
    }

    private async resolveUniqueAlias(user: User): Promise<string> {
        const alias = docId(user.displayName ?? user.email.split('@')[0]);
        const docs = await stores.user.getDocumentsAsync<UserProfile>(where('alias', '>=', alias), where('alias', '<', alias + '\uf8ff'));
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
        await stores.user.setDocument(data, { merge: true });
    }
    
    async setDeletedFlag(id: string): Promise<void> {
        await stores.user.setDocument({ id, deleted: new Date() });
    }
}