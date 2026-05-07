import { firstValueFrom } from 'rxjs';
import type { DashboardSettings } from '../../model/settings.model';
import type { Status } from '../../model/types';
import { UserSettingsService } from './user-settings.service';

const recentSettings = new UserSettingsService('dashboard');

const defaults: DashboardSettings = {
    limit: 4,
    status: {
        todo: true,
        repeat: true,
        wip: true,
        done: false,
        archived: false,
    },
    fav: null,
};

export const MAX_LIMIT = 20;
export const recentFilter = $state<DashboardSettings>({ ...defaults });
let initialized = $state(false);

firstValueFrom(recentSettings.loadSettings()).then((settings) => {
    if (settings) {
        Object.assign(recentFilter, {
            ...defaults,
            ...settings,
            status: { ...defaults.status, ...settings.status },
        });
    }
    initialized = true;
});

export function saveSettings(recentFilter: DashboardSettings) {
    if (initialized) {
        recentSettings.saveSettings(recentFilter);
    }
}

export function toggleStatus(status: Status) {
    recentFilter.status[status] = !recentFilter.status[status];
}