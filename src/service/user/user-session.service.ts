import { DateTime } from 'luxon';
import { orderBy, Timestamp } from 'firebase/firestore';
import { Observable, switchMap } from 'rxjs';
import { stores } from '../base/firestore.service';
import type { UserSession } from '../../model/session.model';
import type { UserSong } from '../../model/song.model';
import { currentUser } from './auth.service';
import { process } from '../../domain/song.logic';
import SongService from './user-song.service';

export default class SessionService {
    private uid: string | undefined;
    readonly sessions: Observable<UserSession[]>;

    constructor(private service: SongService) {
        currentUser.subscribe((user) => (this.uid = user?.uid));
        this.sessions = currentUser.pipe(
            switchMap((user) => stores.usersessions(user?.uid).getDocuments<UserSession>(orderBy('id', 'desc'))),
        );
    }

    async addQuick(song: UserSong, durationMinutes: number): Promise<void> {
        await this.addSession(song, {
            type: 'quick',
            songId: song.id,
            title: song.title,
            durationMinutes: durationMinutes,
            areas: process(song).quickSessionFocus(),
        });
    }

    async addSession(song: UserSong, session: Partial<UserSession>) {
        if (session != null) {
            process(song).applyPropsFrom(session);
            session.status = song.status;
            session.progress = song.progress;

            await this.service.setSong(song);
            await this.setSession(session);
        }
    }

    private async setSession(session: Partial<Omit<UserSession, 'id' | 'createdAt'>>): Promise<void> {
        if (this.uid) {
            const createdAt = Timestamp.now();
            const id = DateTime.now().toFormat('yyMMdd-HHmmssSSS');
            return stores.usersessions(this.uid).setDocument<UserSession>({
                ...session,
                createdAt,
                type: session.type ?? 'free',
                areas: {},
                id
            });
        } else {
            console.warn('Missing uid!')
        }
    }
}
