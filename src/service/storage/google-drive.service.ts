/**
 * GoogleDriveService
 *
 * Single responsibility: Google Drive Picker and file upload.
 *
 * Token management is fully external:
 *   - setAccessToken()         called by GoogleAuthSetupService after login / refresh
 *   - registerTokenRefresher() called by GoogleAuthSetupService in its constructor
 *
 * Script loading (GSI / GAPI) is owned by GoogleAuthSetupService.
 * This service calls ensureScriptsLoaded() via the registered scriptLoader.
 *
 * Public picker API:
 *   - openPicker(options?)       file selection; folders navigable, not selectable
 *   - openFolderPicker(options?) folder-only selection via ViewId.FOLDERS
 */

import type { DriveFile, DrivePickerOptions } from '../../model/file.model';

const API_KEY = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY as string;
const APP_ID = import.meta.env.VITE_GOOGLE_DRIVE_APP_ID as string;

const UPLOAD_API_URL =
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webContentLink,webViewLink';

const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';
const DEFAULT_MIME_TYPES: string[] = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'audio/midi',
    'audio/x-midi',
];

const DEFAULT_OPTIONS: Required<DrivePickerOptions> = {
    mimeTypes: DEFAULT_MIME_TYPES,
    viewMode: 'grid',
    showFolders: true,
    rootFolderId: '',
    showSharedWithMe: true,
    showRecent: true,
    title: 'Select a file from Google Drive',
    width: 700,
    height: 450,
};

type TokenRefresher = () => Promise<string>;
type ScriptLoader = () => Promise<void>;

export class GoogleDriveService {
    private accessToken: string | null = null;
    private tokenRefresher: TokenRefresher | null = null;
    private scriptLoader: ScriptLoader | null = null;

    // -------------------------------------------------------------------------
    // Injected dependencies (set by GoogleAuthSetupService)
    // -------------------------------------------------------------------------

    registerTokenRefresher(refresher: TokenRefresher): void {
        this.tokenRefresher = refresher;
    }

    registerScriptLoader(loader: ScriptLoader): void {
        this.scriptLoader = loader;
    }

    setAccessToken(token: string): void {
        this.accessToken = token;
        setTimeout(() => {
            this.accessToken = null;
        }, 55 * 60 * 1000);
    }

    // -------------------------------------------------------------------------
    // Picker — file selection
    // -------------------------------------------------------------------------

    /**
     * Opens the Google Drive Picker for file selection.
     * Folders are visible for navigation but not selectable.
     * Resolves with the selected DriveFile, or null if cancelled.
     */
    async openPicker(options: DrivePickerOptions = {}): Promise<DriveFile | null> {
        await this.ensureScriptsLoaded();
        const token = await this.ensureAccessToken();
        const opts = { ...DEFAULT_OPTIONS, ...options };

        const mimeTypes = opts.mimeTypes.join(',');
        const viewMode =
            opts.viewMode === 'list'
                ? window.google.picker.DocsViewMode.LIST
                : window.google.picker.DocsViewMode.GRID;

        const buildFileView = (ownedByMe?: boolean): google.picker.DocsView => {
            const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
                .setMimeTypes(mimeTypes)
                .setMode(viewMode)
                .setIncludeFolders(true)
                .setSelectFolderEnabled(false);
            if (opts.rootFolderId) view.setParent(opts.rootFolderId);
            if (ownedByMe !== undefined) view.setOwnedByMe(ownedByMe);
            return view;
        };

        const views: google.picker.View[] = [buildFileView()];
        if (opts.showSharedWithMe) views.push(buildFileView(false));
        if (opts.showRecent) {
            views.push(
                new window.google.picker.DocsView(window.google.picker.ViewId.RECENTLY_PICKED)
                    .setMimeTypes(mimeTypes),
            );
        }

        return this.buildPickerPromise(token, views, opts.title, opts.width, opts.height);
    }

    // -------------------------------------------------------------------------
    // Picker — folder selection
    // -------------------------------------------------------------------------

    /**
     * Opens the Google Drive Picker restricted to folders only.
     * Uses ViewId.FOLDERS — the canonical approach recommended by Google.
     * Resolves with the selected folder as DriveFile (isFolder: true), or null if cancelled.
     */
    async openFolderPicker(
        options: { title?: string; width?: number; height?: number } = {},
    ): Promise<DriveFile | null> {
        await this.ensureScriptsLoaded();
        const token = await this.ensureAccessToken();

        const title = options.title ?? 'Select a folder';
        const width = options.width ?? DEFAULT_OPTIONS.width;
        const height = options.height ?? DEFAULT_OPTIONS.height;

        // ViewId.FOLDERS shows only folders and makes them selectable —
        // the canonical Google-recommended approach for folder-only pickers.
        const folderView = new window.google.picker.DocsView(window.google.picker.ViewId.FOLDERS)
            .setSelectFolderEnabled(true)
            .setMode(window.google.picker.DocsViewMode.LIST);

        return this.buildPickerPromise(token, [folderView], title, width, height);
    }

    // -------------------------------------------------------------------------
    // Picker — shared builder
    // -------------------------------------------------------------------------

    /**
     * Generic picker builder. All view configuration is done by the caller;
     * this method only handles PickerBuilder wiring and callback → DriveFile mapping.
     */
    private buildPickerPromise(
        token: string,
        views: google.picker.View[],
        title: string,
        width: number,
        height: number,
    ): Promise<DriveFile | null> {
        return new Promise((resolve) => {
            let builder = new window.google.picker.PickerBuilder()
                .setAppId(APP_ID)
                .setOAuthToken(token)
                .setDeveloperKey(API_KEY)
                .setTitle(title)
                .setSize(width, height);

            for (const view of views) {
                builder = builder.addView(view);
            }

            builder
                .setCallback((data: google.picker.ResponseObject) => {
                    if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
                        const doc = data[google.picker.Response.DOCUMENTS][0];
                        const mimeType = doc[google.picker.Document.MIME_TYPE];
                        resolve({
                            id: doc[google.picker.Document.ID],
                            name: doc[google.picker.Document.NAME],
                            mimeType,
                            url: doc[google.picker.Document.EMBEDDABLE_URL] ?? doc[google.picker.Document.URL],
                            isFolder: mimeType === FOLDER_MIME_TYPE,
                        });
                    } else if (data[google.picker.Response.ACTION] === google.picker.Action.CANCEL) {
                        resolve(null);
                    }
                })
                .build()
                .setVisible(true);
        });
    }

    /**
     * Uploads a local File to the user's Google Drive (drive.file scope).
     * Returns a DriveFile on success, or null if the user cancelled the token dialog.
     *
     * Uses the Drive REST API multipart upload endpoint:
     * https://developers.google.com/drive/api/guides/manage-uploads#multipart
     */
    async uploadFile(
        file: File,
        options: { folderId?: string; description?: string } = {},
    ): Promise<DriveFile | null> {
        await this.ensureScriptsLoaded();

        let token: string;
        try {
            token = await this.ensureAccessToken();
        } catch (e) {
            if (e instanceof Error && e.message === 'popup_closed') return null;
            throw e;
        }

        const metadata: Record<string, unknown> = {
            name: file.name,
            mimeType: file.type,
            ...(options.description ? { description: options.description } : {}),
            ...(options.folderId ? { parents: [options.folderId] } : {}),
        };

        // Build multipart/related body
        const boundary = `boundary_${Math.random().toString(36).slice(2)}`;
        const delimiter = `--${boundary}`;
        const closeDelimiter = `--${boundary}--`;

        const metadataPart =
            `${delimiter}\r\n` +
            `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
            `${JSON.stringify(metadata)}\r\n`;

        const fileBuffer = await file.arrayBuffer();
        const encoder = new TextEncoder();
        const bodyParts: Uint8Array[] = [
            encoder.encode(metadataPart),
            encoder.encode(`${delimiter}\r\nContent-Type: ${file.type}\r\n\r\n`),
            new Uint8Array(fileBuffer),
            encoder.encode(`\r\n${closeDelimiter}`),
        ];

        const totalLength = bodyParts.reduce((n, p) => n + p.byteLength, 0);
        const body = new Uint8Array(totalLength);
        let offset = 0;
        for (const part of bodyParts) {
            body.set(part, offset);
            offset += part.byteLength;
        }

        const response = await fetch(UPLOAD_API_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': `multipart/related; boundary=${boundary}`,
                'Content-Length': String(body.byteLength),
            },
            body,
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Drive upload failed (${response.status}): ${err}`);
        }

        const json = (await response.json()) as {
            id: string;
            name: string;
            mimeType: string;
            webContentLink?: string;
            webViewLink?: string;
        };

        return {
            id: json.id,
            name: json.name,
            mimeType: json.mimeType,
            url: json.webViewLink ?? json.webContentLink ?? '',
            isFolder: false,
        };
    }

    // -------------------------------------------------------------------------
    // Internal helpers
    // -------------------------------------------------------------------------

    private async ensureScriptsLoaded(): Promise<void> {
        if (!this.scriptLoader) throw new Error('No script loader registered — call registerScriptLoader() first');
        await this.scriptLoader();
    }
    
    private async ensureAccessToken(): Promise<string> {
        if (this.accessToken) return this.accessToken;
        if (!this.tokenRefresher) throw new Error('No token refresher registered');
        return this.tokenRefresher();
    }
}

/** Singleton — token and script state must survive re-renders. */
export const googleDriveService = new GoogleDriveService();