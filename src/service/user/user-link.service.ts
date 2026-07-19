import { firstValueFrom, Observable, of } from 'rxjs';
import { orderBy, Timestamp } from 'firebase/firestore';
import type { UserLink } from '../../model/user.model';
import { stores } from '../base/firestore.service';
import { resolveIcon } from './icon.util';
import { docId } from '../../utils/object.helper';

export class UserLinkService {
    readonly userlinks$: Observable<UserLink[] | null>;

    constructor(private uid?: string) {
        this.userlinks$ = uid ? stores.userLinks(uid).getDocuments<UserLink>(orderBy('order')) : of(null);
    }
    
    async countLinks(): Promise<number> {
        return this.uid ? firstValueFrom(stores.userLinks(this.uid).countDocuments()) : 0;
    }

    async addLink(link: Pick<UserLink, 'url' | 'title' | 'order' | 'placement'>): Promise<string> {
        return this.setLink({
            ...link,
            id: docId(link.url),
            icon: resolveIcon(link.url),
            createdAt: Timestamp.now()
        });
    }

    async setLink(link: Partial<UserLink> & { id: string }): Promise<string> {
        if (this.uid) {
            if (link.url) {
                link.icon = resolveIcon(link.url);
            }
            link.changedAt = Timestamp.now();
            if (link.id) {
                await stores.userLinks(this.uid).setDocument(link, { merge: true });
                return link.id;
            }
        }
    }

    async deleteLink(link: UserLink): Promise<void> {
        if (this.uid) {
            return stores.userLinks(this.uid).removeDocument(link.id);
        }
    }
}
