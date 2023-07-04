import { switchMap } from 'rxjs';
import { currentUser } from './auth.service';
import FirestoreService from './firestore.service';
import type { Song, UserSong } from '../model/song.model';
import { usersongs } from '../store/song.store';
import { Timestamp } from 'firebase/firestore';

const uniqueKey = (s: string) => s?.trim().toLowerCase().replaceAll(' ', '_').replaceAll(/\W/g, '');

export default class SongService {
    public readonly store = new FirestoreService('songs');
    private uid = '';
    
    private appendKeys = (song: UserSong): UserSong => (
        song.artist && song.title ? Object.assign(song, {
            id: uniqueKey(`${song.artist}_${song.title}`),
            uid: this.uid
        }) : song
    );

    constructor() {
        currentUser.subscribe(user => this.uid = user?.uid);
        currentUser.pipe(
            switchMap(user => user ? this.store.getDocuments(user.uid) : [])
        ).subscribe((value) => usersongs.set(value as UserSong[]));
    }

    importSongs(data: UserSong[]): UserSong[] {
        if (data) {
            for(const song of data.map((s) => this.appendKeys(s))) {
                usersongs.replace(song, 'id');
            }
            return data;
        }
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
            tags: [],
            createdAt: Timestamp.now()
        };
    }

    async setSong(song: UserSong): Promise<void> {
        if (this.uid) {
            if (!song.id) {
                song = this.appendKeys(song);
            }
            if (song.id) {
                return this.store.setDocument(song, song.id, { merge: true });
            }
        }
    }
}