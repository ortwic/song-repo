import { Observable, of, switchMap, from, map, auditTime, merge, BehaviorSubject } from 'rxjs';
import { currentUser } from './auth.service';
import FirestoreService, { uniqueKey } from './firestore.service';
import type { UserSong } from '../model/song.model';
import { Timestamp, where } from 'firebase/firestore';

// const sharedFields: (keyof UserSong)[] = ['id', 'artist', 'title', 'genre', 'style', 'key', 'time', 'bpm'];
const sampleId = 'R3VSxFand4d3helVN7aTxWNmzDi1';
const showSamples = location.href.endsWith('samples');
const sharedUid = location.href.split('@')[1];
const localSubject = new BehaviorSubject<UserSong[]>([]);
const store = new FirestoreService('usersongs');

export default class SongService {
    private uid = '';
    hasUser = () => !!this.uid;
    isShared = () => !!sharedUid;

    readonly usersongs: Observable<UserSong[]>;

    private appendId = (song: UserSong, ...more: object[]): UserSong => {
        return !song.id && song.title
            ? Object.assign(
                song,
                {
                    id: uniqueKey(this.uid?.slice(0, 6) ?? '', song.artist ?? 'n/a', song.title),
                    uid: this.uid,
                    createdAt: new Date(),
                },
                ...more
            )
            : song;
    };

    constructor() {
        currentUser.subscribe((user) => (this.uid = user?.uid));
        this.usersongs = currentUser.pipe(
            switchMap(user => this.loadSongs(user)),
            auditTime(990)
        );
    }

    private loadSongs(user: { uid: string }): Observable<UserSong[]> {
        console.debug('load songs for ', user?.uid);

        if (user) {
            return store.getDocuments(user.uid);
        }

        if (sharedUid) {
            return store.getDocuments(sharedUid, where('status', '==', 'done'));
        }

        if (showSamples) {
            const samplesFromFile = from(import('../data/samples.json'))
                .pipe(map<{ default }, UserSong[]>(({ default: data }) => data));
            const samples = store.getDocuments<UserSong>(sampleId)
                .pipe(switchMap(docs => docs.length ? of(docs) : samplesFromFile));
            return merge(samples, localSubject);
        }

        return localSubject;
    }

    newSong(): UserSong {
        return {
            id: '',
            uid: this.uid,
            fav: false,
            status: 'todo',
            progress: 0,
            progressLogs: [],
            genre: '',
            style: '',
            artist: '',
            title: '',
            source: '',
            key: '',
            time: '',
            bpm: '',
            features: [],
            tags: [],
            learnedOn: new Date(),
            createdAt: Timestamp.now(),
            changedAt: Timestamp.now(),
        };
    }

    async setSong(song: UserSong): Promise<string> {
        if (this.uid) {
            song = this.appendId(song);
            song.changedAt = Timestamp.now();
            if (song.progressLogs.at(-1) !== song.progress) {
                song.progressLogs.push(song.progress);
            }
            if (song.id) {
                await store.setDocument(song, { merge: true });
                return song.id;
            }
        }
    }

    async deleteSong(song: UserSong): Promise<void> {
        if (this.uid) {
            return store.removeDocument(song.id);
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
