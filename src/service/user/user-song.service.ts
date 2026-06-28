import { Observable, switchMap, map, auditTime, BehaviorSubject, shareReplay } from 'rxjs';
import { Timestamp, orderBy, where } from 'firebase/firestore';
import { currentUser } from './auth.service';
import { stores } from '../base/firestore.service';
import type { UserSong } from '../../model/song.model';
import { buildIndex } from '../../utils/index-builder';
import { docId } from '../../utils/object.helper';

export const viewStoreId = 'songs.v1';

const localStore = {};
const localSubject = new BehaviorSubject<UserSong[]>([]);

const appendGeneratedId = (uid: string, song: UserSong, ...more: object[]): UserSong => {
    return !song.id && song.title
        ? Object.assign(
            song,
            {
                uid,
                id: docId(song.artist ?? 'n/a', song.title),
            },
            ...more
        )
        : song;
};

export default class SongService {
    private uid: string | undefined;
    hasUser = () => !!this.uid;
    readonly isShared: boolean;
    readonly usersongs$: Observable<UserSong[]>;
    readonly tagIndex$: Observable<ReturnType<typeof buildIndex>>;

    constructor(sharedUid?: string) {
        currentUser.subscribe((user) => (this.uid = user?.uid));
        if (sharedUid) {
            this.isShared = true;
            this.usersongs$ = stores.usersongs(sharedUid)
                .getDocuments(orderBy('id'), where('status', '==', 'done'));
        } else {
            this.usersongs$ = currentUser.pipe(
                switchMap(user => user?.uid 
                    ? stores.usersongs(user.uid).getDocuments<UserSong>(orderBy('id')) 
                    : localSubject),
                auditTime(990),
                shareReplay(1) // one stream only for multiple subscribers
            );

            this.tagIndex$ = this.usersongs$.pipe(
                map((songs) => new Map([
                    ...buildIndex(songs, s => [s.tags], 'tag'),
                    ...buildIndex(songs, s => [s.features], 'feature')
                ].sort((a, b) => b[1].count - a[1].count)))
            );
        }
    }

    async addSong(song: Partial<UserSong>): Promise<string> {
        const newSong = appendGeneratedId(this.uid, {
            fav: false,
            progress: 0,
            touchCount: 0,
            mastery: {},
            genre: '',
            style: '',
            key: '',
            time: '',
            bpm: '',
            features: [],
            learnedOn: '',
            createdAt: Timestamp.now(),
            ...song
        } as UserSong);

        if (!newSong.uid) {
            localStore[newSong.id] = newSong;
        }

        return this.setSong(newSong, true);
    }

    async updateSong(song: UserSong): Promise<string> {
        song.changedAt = Timestamp.now();
        return this.setSong(song);
    }

    async setSong(song: UserSong, forceLocalUpdate = false): Promise<string> {
        if (this.uid) {
            if (song.id) {
                await stores.usersongs(this.uid).setDocument(song, { merge: true });
                return song.id;
            }
        } else if (forceLocalUpdate) {
            localSubject.next(Object.values(localStore));
        }
    }

    async deleteSong(song: UserSong): Promise<void> {
        if (this.uid) {
            return stores.usersongs(this.uid).removeDocument(song.id);
        } else {
            delete localStore[song.id];
            localSubject.next(Object.values(localStore));
        }
    }

    async importSongs(data: UserSong[]): Promise<UserSong[]> {
        if (data) {
            const songs = data.map((s) => appendGeneratedId(this.uid, s, { importedAt: Timestamp.now() }));
            if (this.uid) {
                await stores.usersongs(this.uid).setDocuments(songs, { merge: true });
            } else { 
                // if user is not logged in
                localSubject.next(songs);
            }
            return data;
        }
    }
}
