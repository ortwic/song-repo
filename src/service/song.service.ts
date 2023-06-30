import { switchMap } from 'rxjs';
import { currentUser } from './auth.service';
import FirestoreService from './firestore.service';
import type { Song, UserSong } from '../model/song.model';
import { usersongs } from '../store/song.store';

const uniqueKey = (s: string) => s?.trim().toLowerCase().replaceAll(' ', '_').replaceAll(/\W/g, '');
export const newSong = (): UserSong => ({ status: 'todo', progress: 0, tags: [] } as UserSong);

export default class SongService {
    public readonly store = new FirestoreService('songs');
    private uid = '';
    
    private appendKeys = (song: UserSong): UserSong => (
        Object.assign(song, {
            id: uniqueKey(`${song.artist}_${song.title}`),
            uid: this.uid
        })
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

    async setSong(data: Partial<Song>): Promise<void> {
        if (this.uid) {
            return this.store.addDocument(data, data.id, { merge: true });
        }
    }
}