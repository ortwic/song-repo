import { auditTime, Observable, of, switchMap } from 'rxjs';
import { orderBy, Timestamp } from 'firebase/firestore';
import type { UserLink } from '../model/user.model';
import { currentUser } from './auth.service';
import FirestoreService, { uniqueKey } from './firestore.service';
import { resolveIcon } from './icon.util';

export class UserLinkService {
    private store: FirestoreService;
    isShared = () => !!this.sharedUid;

    readonly userlinks: Observable<UserLink[]>;

    constructor(private sharedUid?: string) {
        this.userlinks = currentUser.pipe(
            switchMap((user) => this.loadLinks(user)),
            auditTime(990)
        );
    }

    private loadLinks(user: { uid: string }): Observable<UserLink[]> {
        if (this.sharedUid) {
            const sharedStore = new FirestoreService(`user/${this.sharedUid}/links`);
            return sharedStore.getDocuments<UserLink>(orderBy('order'));
        }

        if (user?.uid) {
            this.store = new FirestoreService(`user/${user.uid}/links`);
            return this.store.getDocuments<UserLink>(orderBy('order'));
        }

        return of([]);
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
        if (this.store) {
            if (link.url) {
                link.icon = resolveIcon(link.url);
            }
            link.changedAt = Timestamp.now();
            if (link.id) {
                await this.store.setDocument(link, { merge: true });
                return link.id;
            }
        }
    }

    async deleteLink(link: UserLink): Promise<void> {
        if (this.store) {
            return this.store.removeDocument(link.id);
        }
    }
}
