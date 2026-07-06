import type { Status } from "./app.types";

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
    expands: {
        showRecentFilter: boolean;
        showRecentChanges: boolean;
        showRecentWip: boolean;
    },
    custom: Record<string, unknown>;
    recentDays: number;
    limit: number;
    status: Record<Status, boolean>;
    fav: boolean | null;
    tag: {
        type: 'feature' | 'tag';
        value: string;
    } | null;
}

export interface AdvancedSettings extends SongParams {
    editProgressManually: boolean;
}

export interface SongParams {
    quickSessionDeltaPerArea: number;
    quickSessionDurationMinutes: number;
    suggestedMasteryFocusCount: number;
    progressDoneThreshold: number;
    progressArchivedThreshold: number;
    progressRepeatThreshold: number;
    /**
     * Base stability for a song touched exactly once.
     * Higher values = flatter decay curve overall.
     */
    retentionHalfLifeDays: number;
    /**
     * The number of days before a song's retention starts to decay.
     */
    retentionGracePeriodDays: number;
    /**
     * How strongly a new session boosts retention back toward 100%.
     * 0 = no boost (stays at lastRetention), 1 = full reset to 100%.
     */
    retentionSessionBoostFactor: number;
}