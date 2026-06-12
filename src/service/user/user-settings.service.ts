import deepmerge from 'deepmerge';
import { filter, firstValueFrom, Observable, take, map } from 'rxjs';
import type { UserSettings } from '../../model/settings.model';
import UserService, { currentProfile } from './user.service';

const userService = new UserService();

export class UserSettingsService {
    private ready: Promise<void> | null = null;

    loadSettingsAsync(target: UserSettings, defaults: UserSettings): Promise<void> {
        if (!this.ready) {
            this.ready = firstValueFrom(this.loadSettings()).then((settings) => {
                if (settings) {
                    Object.assign(target, deepmerge(defaults, settings));
                }
            });
        }
        return this.ready;
    }

    private loadSettings(): Observable<UserSettings | null> {
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