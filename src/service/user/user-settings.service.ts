import { filter, firstValueFrom, map, Observable, take } from 'rxjs';
import type { UserProfile } from '../../model/user.model';
import UserService, { currentProfile } from './user.service';

type Settings = UserProfile['settings'];
type SettingsKey = keyof NonNullable<Settings>;

const userService = new UserService();

export class UserSettingsService {
    constructor(private key: SettingsKey) {}

    loadSettings(): Observable<Settings[SettingsKey] | null> {
        return currentProfile.pipe(
            filter(p => !!p?.id),
            take(1),
            map(profile => profile?.id && profile.settings?.[this.key] || null)
        );
    }

    async saveSettings(value: Settings[SettingsKey]): Promise<void> {
        const profile = await firstValueFrom(currentProfile.pipe(
            filter(p => !!p?.id)
        ));
        await userService.updateProfile({ id: profile.id, settings: { [this.key]: value } });
    }
}