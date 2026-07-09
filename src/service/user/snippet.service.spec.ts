import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import type { UserSnippet } from '../../model/snippet.model';

// Mocks for external dependencies – adjust paths/exports if they differ from my assumption.
vi.mock('../base/firestore.service', () => ({
    stores: {
        userSnippets: () => ({
            getDocuments: () => of([])
        })
    }
}));

import SnippetService from './snippet.service';

function makeSnippet(overrides: Partial<UserSnippet>): UserSnippet {
    return {
        id: 'default-id',
        groups: [],
        tags: [],
        instruments: [],
        difficulty: 3,
        fav: false,
        touchCount: 0,
        uid: '',
        snippetId: 'default-id',
        ...overrides
    } as UserSnippet;
}

describe('SnippetService.getWithSiblings', () => {
    let service: SnippetService;

    beforeEach(() => {
        service = new SnippetService();
    });

    it('returns the item and all snippets sharing the exact same groups array', async () => {
        const a = makeSnippet({ id: 'a', groups: ['Klavier', 'Etüden'] });
        const b = makeSnippet({ id: 'b', groups: ['Klavier', 'Etüden'] });
        const other = makeSnippet({ id: 'other', groups: ['Gitarre', 'Etüden'] });

        vi.spyOn(service, 'snippets$', 'get').mockReturnValue(of([a, b, other]));

        const result = await firstValueFrom(service.getWithSiblings('a'));

        expect(result.item?.id).toBe('a');
        expect(result.siblings.map(s => s.id).sort()).toEqual(['a', 'b']);
    });

    it('does not treat a matching last segment with a different parent as sibling', async () => {
        const a = makeSnippet({ id: 'a', groups: ['Klavier', 'Etüden'] });
        const other = makeSnippet({ id: 'other', groups: ['Gitarre', 'Etüden'] });

        vi.spyOn(service, 'snippets$', 'get').mockReturnValue(of([a, other]));

        const result = await firstValueFrom(service.getWithSiblings('a'));

        expect(result.siblings.map(s => s.id)).toEqual(['a']);
    });

    it('returns no siblings when the item has no groups', async () => {
        const a = makeSnippet({ id: 'a', groups: [] });
        const b = makeSnippet({ id: 'b', groups: [] });

        vi.spyOn(service, 'snippets$', 'get').mockReturnValue(of([a, b]));

        const result = await firstValueFrom(service.getWithSiblings('a'));

        expect(result.item?.id).toBe('a');
        expect(result.siblings).toEqual([]);
    });

    it('returns notFound when the id does not exist', async () => {
        const a = makeSnippet({ id: 'a', groups: ['Klavier'] });

        vi.spyOn(service, 'snippets$', 'get').mockReturnValue(of([a]));

        const result = await firstValueFrom(service.getWithSiblings('missing'));

        expect(result.item).toBeNull();
        expect(result.siblings).toEqual([]);
    });

    it('waits for a non-empty snippet list before emitting', async () => {
        const a = makeSnippet({ id: 'a', groups: ['Klavier'] });

        // emits empty first, then populated — filter(items => items.length > 0) should skip the first
        vi.spyOn(service, 'snippets$', 'get').mockReturnValue(of([], [a]));

        const result = await firstValueFrom(service.getWithSiblings('a'));

        expect(result.item?.id).toBe('a');
    });
});