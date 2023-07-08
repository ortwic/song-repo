import { switchMap } from 'rxjs';
import { currentUser } from './auth.service';
import FirestoreService from './firestore.service';
import type { UserSong } from '../model/song.model';
import { usersongs } from '../store/song.store';
import { Timestamp } from 'firebase/firestore';

const uniqueKey = (...array: string[]) => array.join('').trim().replaceAll(/\W/g, '');

export default class SongService {
    public readonly store = new FirestoreService('songs');
    private uid = '';
    
    private appendId = (song: UserSong, ...more: object[]): UserSong => (
        !song.id && song.title ? Object.assign(song, {
            id: uniqueKey(this.uid?.slice(0,6) ?? '', song.artist ?? 'n/a', song.title),
            uid: this.uid,
            createdAt: new Date()
        }, ...more) : song
    );

    constructor() {
        currentUser.subscribe(user => this.uid = user?.uid);
        currentUser.pipe(
            switchMap(user => user ? this.store.getDocuments(user.uid) : [])
        ).subscribe((value) => usersongs.set(value as UserSong[]));
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
            tags: [],
            createdAt: Timestamp.now()
        };
    }

    async setSong(song: UserSong): Promise<void> {
        if (this.uid) {
            song = this.appendId(song);
            if (song.id) {
                return this.store.setDocument(song, { merge: true });
            }
        }
    }

    async deleteSong(song: UserSong): Promise<void> {
        if (this.uid) {
            return this.store.removeDocument(song.id);
        }
    }

    async importSongs(data: UserSong[]): Promise<UserSong[]> {
        if (data) {
            const songs = data.map((s) => this.appendId(s, { importedAt: new Date() }));
            if (this.uid) {
                await this.store.setDocuments(songs, { merge: true });                
            } else {
                usersongs.set(songs);
            }
            return data;
        }
    }
}