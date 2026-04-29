import { describe, it, expect, vi, beforeEach } from 'vitest';
import { firstValueFrom, of } from 'rxjs';

// Mock Firebase and rxfire at the lowest level so FirestoreService works without a real app
vi.mock('./firebase.setup', () => ({
    app: {},
}));

vi.mock('firebase/firestore', () => ({
    getFirestore:   vi.fn(() => ({})),
    collection:     vi.fn(() => ({})),
    query:          vi.fn(() => ({})),
    doc:            vi.fn(() => ({})),
    getDoc:         vi.fn(),
    getDocs:        vi.fn(),
    setDoc:         vi.fn(),
    updateDoc:      vi.fn(),
    deleteDoc:      vi.fn(),
    writeBatch:     vi.fn(() => ({ set: vi.fn(), commit: vi.fn() })),
    where:          vi.fn(),
}));

vi.mock('rxfire/firestore', () => ({
    collectionData: vi.fn(() => of([])),
}));

vi.mock('./auth.service', () => ({
    currentUser: of({ uid: 'uid-123' }),
}));

import * as firestore from 'firebase/firestore';
import * as rxfireFs from 'rxfire/firestore';
import UserService from './user.service';

const mockGetDoc  = vi.mocked(firestore.getDoc);
const mockGetDocs = vi.mocked(firestore.getDocs);
const mockSetDoc  = vi.mocked(firestore.setDoc);
const mockCollectionData = vi.mocked(rxfireFs.collectionData);

function makeSnapshot(data: object | null) {
    return {
        exists:  () => data !== null,
        data:    () => data,
        id:      'uid-123',
    } as any;
}

function makeQuerySnapshot(rows: object[]) {
    return {
        forEach: (cb: (d: any) => void) =>
            rows.forEach(row => cb({ id: (row as any).id ?? 'x', data: () => row })),
    } as any;
}

function makeUser(overrides = {}) {
    return {
        uid:         'uid-123',
        displayName: 'John Doe',
        email:       'john@example.com',
        photoURL:    'https://example.com/photo.jpg',
        ...overrides,
    };
}

describe('UserService', () => {
    let service: UserService;

    beforeEach(() => {
        vi.clearAllMocks();
        service = new UserService();
    });

    // -------------------------------------------------------------------------
    describe('isAliasAvailable', () => {
        it('returns true when no profile with this alias exists', async () => {
            mockGetDocs.mockResolvedValue(makeQuerySnapshot([]));

            const result = await firstValueFrom(service.isAliasAvailable('free-alias'));
            expect(result).toBe(true);
        });

        it('returns false when a profile with this alias exists', async () => {
            mockGetDocs.mockResolvedValue(makeQuerySnapshot([{ id: 'uid-456', alias: 'taken' }]));

            const result = await firstValueFrom(service.isAliasAvailable('taken'));
            expect(result).toBe(false);
        });
    });

    // -------------------------------------------------------------------------
    describe('initProfile', () => {
        it('writes the profile when none exists yet', async () => {
            mockGetDoc.mockResolvedValue(makeSnapshot(null));
            mockGetDocs.mockResolvedValue(makeQuerySnapshot([]));
            mockSetDoc.mockResolvedValue(undefined);

            await service.initProfile(makeUser() as any);

            expect(mockSetDoc).toHaveBeenCalledOnce();
            const [, data] = mockSetDoc.mock.calls[0];
            expect(data).toMatchObject({
                id:      'uid-123',
                name:    'John Doe',
                email:   'john@example.com',
                photoURL: 'https://example.com/photo.jpg',
            });
        });

        it('writes nothing when a profile with a name already exists', async () => {
            mockGetDoc.mockResolvedValue(makeSnapshot({ id: 'uid-123', name: 'John Doe' }));

            await service.initProfile(makeUser() as any);

            expect(mockSetDoc).not.toHaveBeenCalled();
        });

        it('stores the provider when SSO login is used', async () => {
            mockGetDoc.mockResolvedValue(makeSnapshot(null));
            mockGetDocs.mockResolvedValue(makeQuerySnapshot([]));
            mockSetDoc.mockResolvedValue(undefined);

            await service.initProfile(makeUser() as any, 'google.com');

            const [, data] = mockSetDoc.mock.calls[0];
            expect(data).toMatchObject({ provider: 'google.com' });
        });

        it('does not store a provider field when none is passed', async () => {
            mockGetDoc.mockResolvedValue(makeSnapshot(null));
            mockGetDocs.mockResolvedValue(makeQuerySnapshot([]));
            mockSetDoc.mockResolvedValue(undefined);

            await service.initProfile(makeUser() as any);

            const [, data] = mockSetDoc.mock.calls[0];
            expect(data).not.toHaveProperty('provider');
        });

        it('sets photoURL to undefined when null', async () => {
            mockGetDoc.mockResolvedValue(makeSnapshot(null));
            mockGetDocs.mockResolvedValue(makeQuerySnapshot([]));
            mockSetDoc.mockResolvedValue(undefined);

            await service.initProfile(makeUser({ photoURL: null }) as any);

            const [, data] = mockSetDoc.mock.calls[0];
            expect(data.photoURL).toBeUndefined();
        });
    });

    // -------------------------------------------------------------------------
    describe('resolveUniqueAlias (via initProfile)', () => {
        it('uses the base alias when it is available', async () => {
            mockGetDoc.mockResolvedValue(makeSnapshot(null));
            mockGetDocs.mockResolvedValue(makeQuerySnapshot([]));
            mockSetDoc.mockResolvedValue(undefined);

            await service.initProfile(makeUser() as any);

            const [, data] = mockSetDoc.mock.calls[0];
            expect(data.alias).toBe('JohnDoe');
        });

        it('appends 2 when the base alias is already taken', async () => {
            mockGetDoc.mockResolvedValue(makeSnapshot(null));
            mockGetDocs.mockResolvedValue(makeQuerySnapshot([{ alias: 'JohnDoe' }]));
            mockSetDoc.mockResolvedValue(undefined);

            await service.initProfile(makeUser() as any);

            const [, data] = mockSetDoc.mock.calls[0];
            expect(data.alias).toBe('JohnDoe2');
        });

        it('increments further when multiple aliases are taken', async () => {
            mockGetDoc.mockResolvedValue(makeSnapshot(null));
            mockGetDocs.mockResolvedValue(makeQuerySnapshot([
                { alias: 'JohnDoe' },
                { alias: 'JohnDoe2' },
                { alias: 'JohnDoe3' },
            ]));
            mockSetDoc.mockResolvedValue(undefined);

            await service.initProfile(makeUser() as any);

            const [, data] = mockSetDoc.mock.calls[0];
            expect(data.alias).toBe('JohnDoe4');
        });

        it('uses the email prefix when no displayName is provided', async () => {
            mockGetDoc.mockResolvedValue(makeSnapshot(null));
            mockGetDocs.mockResolvedValue(makeQuerySnapshot([]));
            mockSetDoc.mockResolvedValue(undefined);

            await service.initProfile(makeUser({ displayName: null }) as any);

            const [, data] = mockSetDoc.mock.calls[0];
            expect(data.alias).toBe('john');
        });
    });

    // -------------------------------------------------------------------------
    describe('updateProfile', () => {
        it('calls setDoc with merge:true', async () => {
            mockSetDoc.mockResolvedValue(undefined);

            await service.updateProfile({ id: 'uid-123', name: 'Jane Doe' });

            expect(mockSetDoc).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({ id: 'uid-123', name: 'Jane Doe' }),
                { merge: true }
            );
        });
    });

    // -------------------------------------------------------------------------
    describe('setAlias', () => {
        it('writes only alias', async () => {
            mockSetDoc.mockResolvedValue(undefined);

            await service.setAlias('uid-123', 'jane-doe');

            expect(mockSetDoc).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({ id: 'uid-123', alias: 'jane-doe' }),
                { merge: true }
            );
        });
    });

    // -------------------------------------------------------------------------
    describe('setDeletedFlag', () => {
        it('writes a deleted timestamp field', async () => {
            mockSetDoc.mockResolvedValue(undefined);

            await service.setDeletedFlag('uid-123');

            expect(mockSetDoc).toHaveBeenCalledOnce();
            const [, data] = mockSetDoc.mock.calls[0];
            expect(data).toMatchObject({
                id:      'uid-123',
                deleted: expect.any(Date),
            });
        });
    });
});