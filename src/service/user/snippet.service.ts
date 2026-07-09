import { combineLatest, map, Observable, of, shareReplay, switchMap } from 'rxjs';
import { Timestamp } from 'firebase/firestore';
import { stores } from '../base/firestore.service';
import type { Snippet, UserSnippet } from '../../model/snippet.model';
import { currentUser } from './auth.service';

const TEMPLATE_USER_ID = '__master';

export default class SnippetService {
    private uid: string | undefined;
    hasUser = () => !!this.uid;

    readonly templates$ = stores.userSnippets(TEMPLATE_USER_ID).getDocuments<Snippet>().pipe(
        shareReplay(1) // one stream only for multiple subscribers
    );
    readonly snippets$: Observable<UserSnippet[]>;

    constructor() {
        currentUser.subscribe((user) => (this.uid = user?.uid));

        const userOverlay$: Observable<UserSnippet[]> = currentUser.pipe(
            switchMap(user => user?.uid
                ? stores.userSnippets(user.uid).getDocuments<UserSnippet>()
                : of([])),
            shareReplay(1)
        );

        this.snippets$ = combineLatest([this.templates$, userOverlay$]).pipe(
            map(([templates, overlays]) => {
                const overlayById = new Map(overlays.map(o => [o.snippetId, o]));
                return templates.map((template): UserSnippet => {
                    const overlay = overlayById.get(template.id);
                    return {
                        ...template,
                        uid: this.uid ?? '',
                        fav: overlay?.fav ?? false,
                        touchCount: overlay?.touchCount ?? 0,
                        changedAt: overlay?.changedAt,
                        snippetId: template.id,
                    };
                });
            }),
            shareReplay(1)
        );
    }

    getSnippet(id: string): Observable<UserSnippet[]> {
        return this.snippets$.pipe(
            map(items => items.filter(p => p.groups?.includes(id)))
        );
    }

    byGroupName(name: string): Observable<UserSnippet[]> {
        return this.snippets$.pipe(
            map(items => items.filter(p => p.groups?.includes(name)))
        );
    }

    async setSnippet(snippet: Partial<UserSnippet> & { id: string }): Promise<void> {
        await this.setOverlay(snippet);
    }

    async touch(snippet: UserSnippet): Promise<void> {
        await this.setOverlay({
            ...snippet,
            touchCount: (snippet.touchCount ?? 0) + 1,
            changedAt: Timestamp.now(),
        });
    }

    private async setOverlay(snippet: Partial<UserSnippet>): Promise<void> {
        if (this.uid) {
            const overlay = {
                ...snippet,
                snippetId: snippet.id,
                uid: this.uid,
                changedAt: snippet.changedAt,
            } as UserSnippet;
            await stores.userSnippets(this.uid).setDocument(overlay, { merge: true });   
        }
    }
}