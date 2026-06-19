import type { Status } from "./types";

export interface UserSettings {
    advanced: AdvancedSettings;
    dashboard: DashboardSettings;
    googleDrive: GoogleDriveSettings;
}

export interface GoogleDriveSettings {
    rootFolderId: string;
    rootFolderName: string;
    showFolders: boolean;
    viewMode: 'list' | 'grid';
}

export interface DashboardSettings {
    setupStatus: {
        hasSongs: boolean;
        hasProfile: boolean;
        hasShared: boolean;
    },
    showFilter: boolean;
    recentDays: number;
    limit: number;
    status: Record<Status, boolean>;
    fav: boolean | null;
    tag: {
        type: 'feature' | 'tag';
        value: string;
    } | null;
}

export interface AdvancedSettings {
    editProgressManually: boolean;
}