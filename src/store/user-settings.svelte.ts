import type { UserSettings } from '../model/settings.model';
import { currentProfile } from '../service/user/user.service';
import { DEFAULT_USER_SETTINGS, userSettingsService } from '../service/user/user-settings.service';

export const MAX_SONGVIEW_DAYS = 30;
export const MAX_SONGVIEW_LIMIT = 20;
export const settings = $state<UserSettings>({ ...DEFAULT_USER_SETTINGS });

let previousId: string | null = null;

currentProfile.subscribe(async (profile) => {
    if (profile?.id && profile.id !== previousId) {
        previousId = profile.id;
        userSettingsService.reset();
        Object.assign(settings, await userSettingsService.loadSettings(DEFAULT_USER_SETTINGS));
    }
});

export function saveSettings(key: keyof UserSettings, value: UserSettings[keyof UserSettings]) {
    Object.assign(settings[key] as object, value);
    userSettingsService.saveSettings({ [key]: value });
}