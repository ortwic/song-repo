import { Observable, switchMap, map, auditTime, BehaviorSubject, shareReplay } from 'rxjs';
import { Timestamp, orderBy, where } from 'firebase/firestore';
import { currentUser } from './auth.service';
import FirestoreService, { uniqueKey } from '../base/firestore.service';
import type { UserSong } from '../../model/song.model';
import { buildIndex } from '../../utils/index-builder';
import { createUserStore } from './user.service';

export const viewStoreId = 'songs.v1';

const store = createUserStore();
const localStore = {};
const localSubject = new BehaviorSubject<UserSong[]>([]);

const appendGeneratedId = (uid: string, song: UserSong, ...more: object[]): UserSong => {
    return !song.id && song.title
        ? Object.assign(
            song,
            {
                uid,
                id: uniqueKey(song.artist ?? 'n/a', song.title),
                createdAt: Timestamp.now(),
            },
            ...more
        )
        : song;
};

export default class SongService {
    private uid = '';
    hasUser = () => !!this.uid;
    isShared = () => !!this.sharedUid;

    readonly usersongs$: Observable<UserSong[]>;
    readonly tagIndex$: Observable<ReturnType<typeof buildIndex>>;

    constructor(private sharedUid?: string) {
        currentUser.subscribe((user) => (this.uid = user?.uid));
        const songs$ = currentUser.pipe(
            switchMap(user => this.loadSongs(user)),
            auditTime(990),
            shareReplay(1) // one stream only for multiple subscribers
        );

        this.usersongs$ = songs$;
        this.tagIndex$ = this.usersongs$.pipe(
            map((songs) => new Map([
                ...buildIndex(songs, s => [s.tags], 'tag'),
                ...buildIndex(songs, s => [s.features], 'feature')
            ].sort((a, b) => b[1].count - a[1].count)))
        );
    }

    private loadSongs(user: { uid: string }): Observable<UserSong[]> {
        if (this.sharedUid) {
            const sharedStore = new FirestoreService(`user/${this.sharedUid}/songs`);
            return sharedStore.getDocuments(orderBy('id'), where('status', '==', 'done'));
        }

        if (user) {
            store.path = `user/${user.uid}/songs`;
            return store.getDocuments(orderBy('id'));
        }

        return localSubject;
    }

    async addSong(song: Partial<UserSong>): Promise<string> {
        const newSong = appendGeneratedId(this.uid, {
            fav: false,
            status: 'todo',
            progress: 0,
            progressLogs: [],
            genre: '',
            style: '',
            key: '',
            time: '',
            bpm: '',
            features: [],
            learnedOn: '',
            ...song
        } as UserSong);

        if (!newSong.uid) {
            localStore[newSong.id] = newSong;
        }

        return this.setSong(newSong, true);
    }

    async setSong(song: UserSong, forceLocalUpdate = false): Promise<string> {
        if (this.uid) {
            song.changedAt = Timestamp.now();
            if (song.progressLogs && song.progressLogs.at(-1) !== song.progress) {
                song.progressLogs.push(song.progress);
            }
            if (song.id) {
                await store.setDocument(song, { merge: true });
                return song.id;
            }
        } else if (forceLocalUpdate) {
            localSubject.next(Object.values(localStore));
        }
    }

    async deleteSong(song: UserSong): Promise<void> {
        if (this.uid) {
            return store.removeDocument(song.id);
        } else {
            delete localStore[song.id];
            localSubject.next(Object.values(localStore));
        }
    }

    async importSongs(data: UserSong[]): Promise<UserSong[]> {
        if (data) {
            const songs = data.map((s) => appendGeneratedId(this.uid, s, { importedAt: new Date() }));
            if (this.uid) {
                await store.setDocuments(songs, { merge: true });
            } else { 
                // if user is not logged in
                localSubject.next(songs);
            }
            return data;
        }
    }
}
