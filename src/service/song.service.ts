import { Observable, of, switchMap, from, map, auditTime, merge, BehaviorSubject } from 'rxjs';
import { currentUser } from './auth.service';
import FirestoreService, { uniqueKey } from './firestore.service';
import type { UserSong } from '../model/song.model';
import { Timestamp, orderBy, where } from 'firebase/firestore';

// const sharedFields: (keyof UserSong)[] = ['id', 'artist', 'title', 'genre', 'style', 'key', 'time', 'bpm'];
const sampleId = 'R3VSxFand4d3helVN7aTxWNmzDi1';
const localStore = {};
const localSubject = new BehaviorSubject<UserSong[]>([]);
const store = new FirestoreService('user');

export const viewStoreId = 'songs.v1';

export default class SongService {
    private uid = '';
    hasUser = () => !!this.uid;
    isShared = () => !!this.sharedUid;

    readonly usersongs: Observable<UserSong[]>;

    private appendId = (song: UserSong, ...more: object[]): UserSong => {
        return !song.id && song.title
            ? Object.assign(
                song,
                {
                    id: uniqueKey(song.artist ?? 'n/a', song.title),
                    uid: this.uid,
                    createdAt: Timestamp.now(),
                },
                ...more
            )
            : song;
    };

    constructor(private sharedUid?: string, private showSamples = false) {
        currentUser.subscribe((user) => (this.uid = user?.uid));
        this.usersongs = currentUser.pipe(
            switchMap(user => this.loadSongs(user)),
            auditTime(990)
        );
    }

    private loadSongs(user: { uid: string }): Observable<UserSong[]> {
        if (this.sharedUid) {
            const sharedStore = new FirestoreService(`user/${this.sharedUid}/songs`);
            return sharedStore.getDocuments(orderBy('id'), where('status', '==', 'done'));
        }

        if (this.showSamples) {
            const sampleStore = new FirestoreService(`user/${sampleId}/songs`);
            const samplesFromFile = from(import('../data/samples.json'))
                .pipe(map<{ default }, UserSong[]>(({ default: data }) => data));
            const samples = sampleStore.getDocuments<UserSong>(orderBy('id'))
                .pipe(switchMap(docs => docs.length ? of(docs) : samplesFromFile));
            return merge(samples, localSubject);
        }

        if (user) {
            store.path = `user/${user.uid}/songs`;
            return store.getDocuments(orderBy('id'));
        }

        return localSubject;
    }

    async addSong(song: Partial<UserSong>): Promise<string> {
        const newSong = this.appendId({
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
        if (this.uid && !this.showSamples) {
            song.changedAt = Timestamp.now();
            if (song.progressLogs && song.progressLogs.at(-1) !== song.progress) {
                song.progressLogs.push(song.progress);
            }
            if (song.id) {
                await store.setDocument(song, { merge: true });
                return song.id;
            }
        } else if (!this.showSamples || forceLocalUpdate) {
            localSubject.next(Object.values(localStore));
        }
    }

    async deleteSong(song: UserSong): Promise<void> {
        if (this.uid && !this.showSamples) {
            return store.removeDocument(song.id);
        } else {
            delete localStore[song.id];
            localSubject.next(Object.values(localStore));
        }
    }

    async importSongs(data: UserSong[]): Promise<UserSong[]> {
        if (data) {
            const songs = data.map((s) => this.appendId(s, { importedAt: new Date() }));
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
