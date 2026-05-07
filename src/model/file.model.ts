export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    url: string;
}

export interface DrivePickerOptions {
    /**
     * MIME types to show in the picker.
     * Defaults to PDF, common images, and MIDI.
     */
    mimeTypes?: string[];

    /**
     * Display mode for the file list.
     *   'grid' — thumbnail grid, navigable (default, feels like Google Drive)
     *   'list' — compact list view
     */
    viewMode?: 'grid' | 'list';

    /**
     * Show folders so the user can navigate into them.
     * Folders themselves are never selectable as a result.
     * Default: true
     */
    showFolders?: boolean;

    /**
     * Start the picker inside a specific folder (Drive folder ID).
     * If omitted the picker opens at the user's Drive root.
     */
    rootFolderId?: string;

    /**
     * Also add a "Shared with me" view tab alongside My Drive.
     * Default: false
     */
    showSharedWithMe?: boolean;

    /**
     * Also add a "Recent" view tab.
     * Default: false
     */
    showRecent?: boolean;

    /**
     * Title shown in the picker header.
     * Default: 'Select a file from Google Drive'
     */
    title?: string;

    /**
     * Picker dialog dimensions in pixels.
     * Google's default is 566 × 350; bump these for more breathing room.
     */
    width?: number;
    height?: number;
}
