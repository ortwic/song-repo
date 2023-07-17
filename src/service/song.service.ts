import { Observable, of, switchMap, from, map } from 'rxjs';
import { currentUser } from './auth.service';
import FirestoreService, { uniqueKey } from './firestore.service';
import type { UserSong } from '../model/song.model';
import { usersongs } from '../store/song.store';
import { Timestamp, where } from 'firebase/firestore';

const sharedFields: (keyof UserSong)[] = ['id', 'artist', 'title', 'genre', 'style', 'key', 'time', 'bpm'];
const sharedUid = location.href.split('@')[1];
const store = new FirestoreService('usersongs');

export const samples = from(import('../data/samples.json'))
    .pipe(map(({ default: data }) => data as unknown as UserSong[]));

export default class SongService {
    private uid = '';
    hasUser = () => !!this.uid;
    isShared = () => !!sharedUid;

    private appendId = (song: UserSong, ...more: object[]): UserSong =>
        !song.id && song.title
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

    constructor() {
        currentUser.subscribe((user) => (this.uid = user?.uid));
        currentUser.pipe(switchMap(this.loadSongs)).subscribe((value) => usersongs.set(value));
    }

    private loadSongs(user: { uid: string }): Observable<UserSong[]> {
        if (user) {
            return store.getDocuments(user.uid);
        }

        if (sharedUid) {
            return store.getDocuments(sharedUid, where('status', '==', 'done'));
        }

        return of(undefined);
    }

    newSong(): UserSong {
        return {
            id: '',
            uid: this.uid,
            fav: false,
            status: 'todo',
            progress: 0,
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
        };
    }

    async setSong(song: UserSong): Promise<string> {
        if (this.uid) {
            song = this.appendId(song);
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
                usersongs.set(songs);
            }
            return data;
        }
    }
}
