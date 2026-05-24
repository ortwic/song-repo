import { auditTime, Observable, of, switchMap, tap } from 'rxjs';
import { orderBy, Timestamp } from 'firebase/firestore';
import type { UserLink } from '../../model/user.model';
import { currentUser } from './auth.service';
import { stores, uniqueKey } from '../base/firestore.service';
import { resolveIcon } from './icon.util';

export class UserLinkService {
    private uid: string | undefined;
    readonly isShared: boolean;

    readonly userlinks$: Observable<UserLink[]>;

    constructor(sharedUid?: string) {
        if (sharedUid) {
            this.isShared = true;
            this.userlinks$ = stores.userlinks(sharedUid).getDocuments<UserLink>(orderBy('order'));
        } else {
            this.userlinks$ = currentUser.pipe(
                tap((user) => (this.uid = user?.uid)),
                switchMap((user) => stores.userlinks(user?.uid).getDocuments<UserLink>(orderBy('order'))),
                auditTime(990)
            );
        }
    }

    async addLink(url: string, title?: string, order?: number): Promise<string> {
        return this.setLink({
            id: uniqueKey(url),
            url,
            title,
            icon: resolveIcon(url),
            order,
            createdAt: Timestamp.now(),
        });
    }

    async setLink(link: Partial<UserLink> & { id: string }): Promise<string> {
        if (this.uid) {
            if (link.url) {
                link.icon = resolveIcon(link.url);
            }
            link.changedAt = Timestamp.now();
            if (link.id) {
                await stores.userlinks(this.uid).setDocument(link, { merge: true });
                return link.id;
            }
        }
    }

    async deleteLink(link: UserLink): Promise<void> {
        if (this.uid) {
            return stores.userlinks(this.uid).removeDocument(link.id);
        }
    }
}
