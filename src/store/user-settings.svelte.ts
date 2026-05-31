import deepmerge from 'deepmerge';
import type { UserSettings } from '../model/settings.model';
import { currentProfile } from '../service/user/user.service';
import { userSettingsService } from '../service/user/user-settings.service';

const defaults: UserSettings = {
    dashboard: {
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
        fav: null,
    },
    googleDrive: {
        rootFolderId: '',
        rootFolderName: '',
        showFolders: true,
        viewMode: 'grid',
    },
};

export const MAX_SONGVIEW_DAYS = 30;
export const MAX_SONGVIEW_LIMIT = 20;
export const settings = $state<UserSettings>({ ...defaults });

let previousId: string | null = null;

currentProfile.subscribe((profile) => {
    if (profile?.id && profile.id !== previousId) {
        previousId = profile.id;
        userSettingsService.reset();
        Object.assign(settings, deepmerge(defaults, {}));
        userSettingsService.loadSettingsAsync(settings, defaults);
    }
});

export function saveSettings(key: keyof UserSettings, value: UserSettings[keyof UserSettings]) {
    userSettingsService.saveSettings({ [key]: value });
}