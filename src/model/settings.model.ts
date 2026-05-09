import type { Status } from "./types";

export interface UserSettings {
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
    showFilter: boolean;
    limit: number;
    status: Record<Status, boolean>;
    fav: boolean | null;
    tag?: {
        type: 'feature' | 'tag';
        value: string;
    }
}