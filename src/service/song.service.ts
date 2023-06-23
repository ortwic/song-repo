import { switchMap } from 'rxjs';
import { currentUser } from './auth.service';
import FirestoreService from './firestore.service';
import type { Song } from '../model/song.model';
import { songs } from '../store/song.store';

const uniqueKey = (s: string) => s?.trim().toLowerCase().replaceAll(' ', '_').replaceAll(/\W/g, '');
export const newSong = (): Song => ({ status: 'todo', progress: 0, tags: [] } as Song);

export default class SongService {
    public readonly store = new FirestoreService('songs');
    private uid: string;

    private appendKeys = (s: Song) => Object.assign(s, {
        id: uniqueKey(`${s.artist}_${s.title}`),
        uid: this.uid
    });

    constructor() {
        currentUser.subscribe(user => this.uid = user?.uid);
        currentUser.pipe(
            switchMap(user => user ? this.store.getDocuments(user.uid) : [])
        ).subscribe((value) => songs.set(value as Song[]));
    }

    importSongs(data: Song[]): Song[] {
        if (data) {
            for(const song of data.map(this.appendKeys)) {
                songs.replace(song, 'id');
            }
            return data;
        }
    }

    async setSong(data: Partial<Song>): Promise<void> {
        console.log(data);
        if (this.uid) {
            return this.store.addDocument(data, data.id, { merge: true });
        }
    }
}