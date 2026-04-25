import { logAction } from '../../store/notification.store';
import { showError } from '../../store/notification.store';
import type { UserSong } from '../../model/song.model';
import type { Status } from '../../model/types';
import type SongService from '../../service/user-song.service';

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
    constructor(private service: SongService) {}

    openUri(song: UserSong): void {
        if (!song.uri) return;
        try {
            new URL(song.uri);
            window.open(song.uri, '_blank');
        } catch {
            showError(`Invalid URI: ${song.uri}`);
        }
    }

    search(song: UserSong, action: SearchAction): void {
        logAction({ type: 'search', resource: action.resource, song });
        window.open(action.url(song), '_blank');
    }

    async setUri(song: UserSong, uri: string): Promise<void> {
        if (uri && song.uri !== uri) {
            song.uri = uri;
            await this.service.setSong(song);
        }
    }

    async toggleFavorite(song: UserSong): Promise<void> {
        song.fav = !song.fav;
        await this.service.setSong(song);
    }

    async changeStatus(song: UserSong, status: Status): Promise<void> {
        song.status = status;
        await this.service.setSong(song);
    }

    static deriveStatus(newValue: number, oldValue: number): Status | undefined {
        if (newValue > 90)        return 'done';
        if (newValue < 10)        return 'archived';
        if (newValue < oldValue)  return 'repeat';
        if (newValue > oldValue)  return 'wip';
        return undefined;
    }

    async updateProgress(song: UserSong, newValue: number, oldValue: number): Promise<Status | undefined> {
        song.progress = newValue;
        const newStatus = SongActions.deriveStatus(newValue, oldValue);
        if (newStatus) {
            song.status = newStatus ?? song.status;
        }
        await this.service.setSong(song);
        return newStatus;
    }

    async delete(song: UserSong): Promise<void> {
        await this.service.deleteSong(song);
    }
}