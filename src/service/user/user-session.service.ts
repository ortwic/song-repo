import { DateTime } from 'luxon';
import { orderBy, Timestamp } from 'firebase/firestore';
import { Observable, switchMap } from 'rxjs';
import type { SongEntity } from '../../domain/song.entity';
import type { TrainingFocus } from '../../model/types';
import type { UserSession } from '../../model/session.model';
import { stores } from '../base/firestore.service';
import { currentUser } from './auth.service';
import type SongService from './user-song.service';

export default class SessionService {
    private uid: string | undefined;
    readonly sessions: Observable<UserSession[]>;

    constructor(private service: SongService) {
        currentUser.subscribe((user) => (this.uid = user?.uid));
        this.sessions = currentUser.pipe(
            switchMap((user) => stores.usersessions(user?.uid).getDocuments<UserSession>(orderBy('id', 'desc'))),
        );
    }

    async addQuick(entity: SongEntity, durationMinutes: number): Promise<void> {
        await this.addSession(entity, {
            type: 'quick',
            songId: entity.id,
            title: entity.title,
            touchCount: entity.touchCount,
            durationMinutes: durationMinutes,
            areas: entity.quickSessionFocus(),
        });
    }

    async addSession(entity: SongEntity, session: Partial<UserSession>) {
        if (session != null) {
            this.updateSong(entity, session);
            session.status = entity.resolvedStatus();
            session.progress = entity.progress;

            await this.service.updateSong(entity);
            await this.setSession(session);
        }
    }

    private updateSong(entity: SongEntity, session: Partial<UserSession>): void {
        const isImportMode = session.type === 'import';
        if (session.tags) {
            entity.tags = session.tags;
        }
        if (session.notes) {
            entity.notes = session.notes;
        }
        if (session.areas) {
            if (!entity.mastery) {
                entity.mastery = {};
            }
            for (const [key, value] of Object.entries(session.areas) as [TrainingFocus, number][]) {
                entity.mastery[key] = isImportMode ? value : (entity.mastery[key] ?? 0) + value;
            }
        }

        const derivedProgress = !isImportMode ? entity.progressFromMastery() ?? session.progress : session.progress;
        const oldProgress     = entity.progress ?? 0;
        const newProgress     = derivedProgress ?? oldProgress;
        if (newProgress !== oldProgress) {
            entity.progress = newProgress;
        }

        entity.touchCount = (session.touchCount ?? 0) + 1;
        entity.lastRetention = entity.retentionFactor(entity.changedAt);
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
