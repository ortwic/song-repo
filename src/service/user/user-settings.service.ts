import deepmerge from 'deepmerge';
import { filter, firstValueFrom, Observable, take, map } from 'rxjs';
import type { UserSettings } from '../../model/settings.model';
import UserService, { currentProfile } from './user.service';

const userService = new UserService();

export const DEFAULT_USER_SETTINGS: UserSettings = {
    advanced: {
        editProgressManually: false,
        quickSessionDeltaPerArea: 1,
        retentionHalfLifeDays: 10,
        retentionSessionBoostFactor: 0.8,
        retentionGracePeriodDays: 0,
    },
    dashboard: {
        setupStatus: {
            hasSongs: false,
            hasProfile: false,
            hasShared: false,
        },
        showFilter: true,
        recentDays: 1,
        limit: 4,
        status: {
            todo: true,
            repeat: true,
            wip: true,
            done: false,
            archived: false,
        },
        tag: null,
        fav: null,
    },
    googleDrive: {
        rootFolderId: '',
        rootFolderName: '',
        showFolders: true,
        viewMode: 'grid',
    },
} as const;

export class UserSettingsService {
    private ready: Promise<UserSettings> | null = null;

    async loadSettings(defaults = DEFAULT_USER_SETTINGS): Promise<UserSettings> {
        if (!this.ready) {
            this.ready = firstValueFrom(this.fetchSettings())
                .then((stored) => deepmerge(defaults, stored ?? {}));
        }
        return this.ready;
    }

    private fetchSettings(): Observable<UserSettings | null> {
        return currentProfile.pipe(
            filter((p) => !!p?.id),
            take(1),
            map((profile) => (profile?.settings as UserSettings) || null),
        );
    }
    
    reset(): void {
        this.ready = null;
    }

    async saveSettings(value: Partial<UserSettings>): Promise<void> {
        await this.ready;
        const profile = await firstValueFrom(currentProfile.pipe(filter((p) => !!p?.id)));
        const settings = { ...profile.settings, ...value };
        await userService.updateProfile({ id: profile.id, settings });
    }
}

export const userSettingsService = new UserSettingsService();