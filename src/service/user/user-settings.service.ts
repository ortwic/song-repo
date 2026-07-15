import deepmerge from 'deepmerge';
import { filter, firstValueFrom, Observable, take, map } from 'rxjs';
import type { UserSettings } from '../../model/settings.model';
import { currentProfile } from '../../store/profile.store';
import { DEFAULT_USER_SETTINGS } from './default-settings';
import UserService from './user.service';

const userService = new UserService();

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