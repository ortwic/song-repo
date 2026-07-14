import { combineLatest, filter, map, Observable, of, shareReplay, switchMap, take } from 'rxjs';
import { Timestamp } from 'firebase/firestore';
import { stores } from '../base/firestore.service';
import type { Snippet, UserSnippet } from '../../model/snippet.model';
import { currentUser } from './auth.service';

export const SNIPPETS_SETTINGS_ID = 'snippets.v1';
const TEMPLATE_USER_ID = '__master';

function areEquivalent(a = [], b = []) {
    return a.length === b.length && a.every((value, i) => value === b[i]);
}

export default class SnippetService {
    private uid: string | undefined;
    hasUser = () => !!this.uid;
    canAccess = (snippet: UserSnippet): boolean => 
        snippet.status === 'published' &&
        (snippet.access === 'any' || snippet.access === 'users' && this.hasUser());

    readonly templates$ = stores.userSnippets(TEMPLATE_USER_ID).getDocuments<Snippet>().pipe(
        map(items => items.filter(this.canAccess)),
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

    getWithSiblings(id: string): Observable<{ item: UserSnippet; siblings: UserSnippet[] }> {
        const notFound = { item: null, siblings: [] };
        return this.snippets$.pipe(
            filter(items => items.length > 0),
            map(items => {
                const item = items.find(s => s.id === id);
                if (item) {
                    if (!item.groups?.length) {
                        return { item, siblings: [] };
                    }
                    const siblings = items.filter(s => areEquivalent(s.groups, item.groups))
                        .toSorted((a, b) => a.title.localeCompare(b.title));
                    return { item, siblings };
                }
                return notFound;
            })
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