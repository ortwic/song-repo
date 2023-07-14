import { Observable, of, switchMap } from 'rxjs';
import { currentUser } from './auth.service';
import FirestoreService from './firestore.service';
import type { UserSong } from '../model/song.model';
import { usersongs } from '../store/song.store';
import { Timestamp, where } from 'firebase/firestore';

const sharedFields: (keyof UserSong)[] = ['id', 'artist', 'title', 'genre', 'style', 'key', 'time', 'bpm'];
const sharedUid = new URLSearchParams(location.search).get('share');
const store = new FirestoreService('usersongs');
const uniqueKey = (...array: string[]) =>
    array.join('').trim().replaceAll(/\W/g, '');

export default class SongService {
    private uid = '';
    hasUser = () => !!this.uid;
    isShared = () => !!sharedUid;

    private appendId = (song: UserSong, ...more: object[]): UserSong =>
        !song.id && song.title
            ? Object.assign(
                  song,
                  {
                      id: uniqueKey(
                          this.uid?.slice(0, 6) ?? '',
                          song.artist ?? 'n/a',
                          song.title
                      ),
                      uid: this.uid,
                      createdAt: new Date(),
                  },
                  ...more
              )
            : song;

    constructor() {
        currentUser.subscribe((user) => (this.uid = user?.uid));
        currentUser.pipe(switchMap(this.loadSongs))
            .subscribe((value) => usersongs.set(value));
    }
    
    private loadSongs(user: { uid: string; }): Observable<UserSong[]> {
        if (user) {
            return store.getDocuments(user.uid);
        }

        if (sharedUid) {
            return store.getDocuments(sharedUid, where('status', '==', 'done'));
        }

        return of([]);
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
            const songs = data.map((s) =>
                this.appendId(s, { importedAt: new Date() })
            );
            if (this.uid) {
                await store.setDocuments(songs, { merge: true });
            } else {
                usersongs.set(songs);
            }
            return data;
        }
    }
}
