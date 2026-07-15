import { firstValueFrom, Observable, of } from 'rxjs';
import { orderBy, Timestamp } from 'firebase/firestore';
import type { UserLink } from '../../model/user.model';
import { stores } from '../base/firestore.service';
import { resolveIcon } from './icon.util';
import { docId } from '../../utils/object.helper';

export class UserLinkService {
    readonly userlinks$: Observable<UserLink[] | null>;

    constructor(private uid?: string) {
        this.userlinks$ = uid ? stores.userlinks(uid).getDocuments<UserLink>(orderBy('order')) : of(null);
    }
    
    async countLinks(): Promise<number> {
        return this.uid ? firstValueFrom(stores.userlinks(this.uid).countDocuments()) : 0;
    }

    async addLink(url: string, title?: string, order?: number): Promise<string> {
        return this.setLink({
            id: docId(url),
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
