import type { UserSettings } from "../../model/settings.model";

export const DEFAULT_USER_SETTINGS: UserSettings = {
    advanced: {
        editProgressManually: false,
        quickSessionDeltaPerArea: 1,
        progressArchivedThreshold: 10,
        progressDoneThreshold: 90,
        progressRepeatThreshold: 10,
        retentionHalfLifeDays: 10,
        retentionSessionBoostFactor: 0.8,
        retentionGracePeriodDays: 0,
        suggestedMasteryFocusCount: 3,
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