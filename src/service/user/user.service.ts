import type { User } from 'firebase/auth';
import { where } from 'firebase/firestore';
import { filter, from, map, Observable, of, startWith, switchMap } from 'rxjs';
import { stores } from '../base/firestore.service';
import type { UserProfile, UserProfileView } from '../../model/user.model';
import { UserLinkService } from './user-link.service';

export default class UserService {

    constructor() {
    }

    getProfileWithLinks(alias: string): Observable<UserProfileView> | never {
        return this.getProfileByAlias(alias).pipe(
            switchMap(profile => new UserLinkService(profile.id).userlinks$.pipe(
                map(links => ({ ...profile, links } as UserProfileView))
            )),
            filter(p => p.id && p.links !== null),
            startWith({} as UserProfileView)
        );
    }

    private getProfileByAlias(alias: string): Observable<UserProfile> {
        return stores.user.getDocuments<UserProfile>(where('alias', '==', alias)).pipe(
            switchMap(docs => docs.length ? of(docs[0]) : of({} as UserProfile))
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
        const uniqueKey = (...array: string[]) => array.join('').trim().replaceAll(/\W/g, '');
        const alias = uniqueKey(user.displayName ?? user.email.split('@')[0]);
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