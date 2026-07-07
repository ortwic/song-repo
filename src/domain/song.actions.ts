import { type DialogArgs, openDialog } from '../components/dialog-context.svelte';
import type { UserSession } from '../model/session.model';
import type { Song, UserSong } from '../model/song.model';
import type { StatusMode } from '../model/app.types';
import type SessionService from '../service/user/user-session.service';
import type SongService from '../service/user/user-song.service';
import { logAction } from '../store/notification.store';
import type { SongEntity } from './song.entity';

export interface SearchAction {
    label: string;
    icon: string;
    resource: string;
    url: (song: UserSong) => string;
}

export const SEARCH_ACTIONS: SearchAction[] = [
    {
        label: 'Musescore',
        icon: 'bx-music',
        resource: 'musescore',
        url: (s) => `https://musescore.com/sheetmusic?text=${s.artist}+${s.title}`,
    },
    {
        label: 'Sheet Music (PDF)',
        icon: 'bxs-file-pdf',
        resource: 'sheet music',
        url: (s) => `https://google.com/search?q="${s.artist}"+"${s.title}"+sheet+music+filetype:pdf`,
    },
    {
        label: 'Synthesia Tutorial',
        icon: 'bx-play-circle',
        resource: 'tutorial',
        url: (s) => `https://google.com/search?q="${s.artist}"+"${s.title}"+synthesia+tutorial`,
    },
    {
        label: 'Lyrics',
        icon: 'bx-text',
        resource: 'lyrics',
        url: (s) => `https://google.com/search?q="${s.artist}"+"${s.title}"+lyrics`,
    },
    {
        label: 'MIDI',
        icon: 'bxs-piano',
        resource: 'midi file',
        url: (s) => `https://google.com/search?q="${s.artist}"+"${s.title}"+filetype:midi`,
    },
];

export class SongActions {
    constructor(private songService: SongService, private sessionService: SessionService) {
    }

    async showResource(song: UserSong): Promise<void> {
        if (song.uri) {
            return openDialog<Song>('ResourceViewer', song);
        } 
        return this.editSong(song);
    }

    search(song: UserSong, action: SearchAction): void {
        logAction({ type: 'search', resource: action.resource, song });
        window.open(action.url(song), '_blank');
    }

    async editSong(song: UserSong): Promise<void> {
        const editedSong = await openDialog<UserSong, UserSong>('EditSongDialog', song);
        if (editedSong) {
            await this.songService.setSong(editedSong);
        }
    }

    async toggleFavorite(song: UserSong): Promise<void> {
        song.fav = !song.fav;
        await this.songService.setSong(song);
    }

    async changeStatus(song: UserSong, status: StatusMode): Promise<void> {
        song.status = status !== 'auto' ? status : null;
        await this.songService.setSong(song);
    }

    async runSession(entity: SongEntity): Promise<UserSession> {
        const session = await openDialog<SongEntity, UserSession>('SessionDialog', entity);
        if (session) {
            await this.sessionService.addSongSession(entity, session);
        }
        return session;
    }

    async quickSession(entity: SongEntity, durationMinutes: number): Promise<void> {
        return this.sessionService.addQuickSong(entity, durationMinutes);
    }

    async delete(song: UserSong, args?: DialogArgs): Promise<void> {
        const confirmed = !args || await openDialog<DialogArgs, boolean>('ConfirmDialog', args);
        if (confirmed === true) {
            await this.songService.deleteSong(song);
        }
    }
}
