import { Observable, of, switchMap, from, map, auditTime, merge, BehaviorSubject } from 'rxjs';
import { currentUser } from './auth.service';
import FirestoreService, { uniqueKey } from './firestore.service';
import type { UserSong } from '../model/song.model';
import { Timestamp, orderBy, where } from 'firebase/firestore';

// const sharedFields: (keyof UserSong)[] = ['id', 'artist', 'title', 'genre', 'style', 'key', 'time', 'bpm'];
const sampleId = 'R3VSxFand4d3helVN7aTxWNmzDi1';
const showSamples = () => location.href.endsWith('samples');
const localStore = {};
const localSubject = new BehaviorSubject<UserSong[]>([]);
const store = new FirestoreService('usersongs');

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
                    id: uniqueKey(this.uid?.slice(0, 6) ?? '', song.artist ?? 'n/a', song.title),
                    uid: this.uid,
                    createdAt: Timestamp.now(),
                },
                ...more
            )
            : song;
    };

    constructor(private sharedUid?: string) {
        currentUser.subscribe((user) => (this.uid = user?.uid));
        this.usersongs = currentUser.pipe(
            switchMap(user => this.loadSongs(user)),
            auditTime(990)
        );
    }

    private loadSongs(user: { uid: string }): Observable<UserSong[]> {
        const byUser = (uid: string) => where('uid', '==', uid);
        if (this.sharedUid) {
            return store.getDocuments(byUser(this.sharedUid), orderBy('id'), where('status', '==', 'done'));
        }

        if (user) {
            return store.getDocuments(byUser(user.uid), orderBy('id'));
        }

        if (showSamples()) {
            const samplesFromFile = from(import('../data/samples.json'))
                .pipe(map<{ default }, UserSong[]>(({ default: data }) => data));
            const samples = store.getDocuments<UserSong>(byUser(sampleId), orderBy('id'))
                .pipe(switchMap(docs => docs.length ? of(docs) : samplesFromFile));
            return merge(samples, localSubject);
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
        if (this.uid) {
            song.changedAt = Timestamp.now();
            if (song.progressLogs.at(-1) !== song.progress) {
                song.progressLogs.push(song.progress);
            }
            if (song.id) {
                await store.setDocument(song, { merge: true });
                return song.id;
            }
        } else if (!showSamples() || forceLocalUpdate) {
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
