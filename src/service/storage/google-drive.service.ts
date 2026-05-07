/**
 * GoogleDriveService
 *
 * Handles incremental OAuth for the drive.file scope and wraps the
 * Google Picker API. No changes to AuthService are required — the
 * Drive token is acquired lazily, only when the user opens the picker.
 *
 * Prerequisites (Google Cloud Console, same GCP project as Firebase):
 *   1. Enable "Google Drive API" and "Google Picker API"
 *   2. Create an API Key  → restrict to "Google Picker API" + your domain
 *   3. Create an OAuth 2.0 Client ID (Web application)
 *      → Authorized JavaScript origins, e. g. http://localhost:5173
 *
 * Note: The Google Picker API and GSI have no official npm packages —
 * dynamic script loading is the only supported integration path.
 */

import type { DriveFile, DrivePickerOptions } from "../../model/file.model";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY as string;
const CLIENT_ID = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID as string;
const APP_ID = import.meta.env.VITE_GOOGLE_APP_ID as string;

const DRIVE_FILE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const PICKER_API_URL   = 'https://apis.google.com/js/api.js';
const GSI_URL          = 'https://accounts.google.com/gsi/client';

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
  mimeTypes:       DEFAULT_MIME_TYPES,
  viewMode:        'list',
  showFolders:     true,
  rootFolderId:    '',
  showSharedWithMe: true,
  showRecent:      true,
  title:           'Select a file from Google Drive',
  width:           700,
  height:          450,
};

// ─── Service ──────────────────────────────────────────────────────────────────

type TokenClient = {
  requestAccessToken: (opts?: { prompt?: string }) => void;
};

export class GoogleDriveService {
  private pickerApiLoaded = false;
  private tokenClient: TokenClient | null = null;
  private accessToken: string | null = null;

  // ─── Public API ─────────────────────────────────────────────────────────────

  /**
   * Opens the Google Drive Picker and resolves with the selected file,
   * or null if the user cancelled.
   *
   * Lazily loads all required Google scripts on first call.
   */
  async openPicker(options: DrivePickerOptions = {}): Promise<DriveFile | null> {
    await this.ensureScriptsLoaded();
    const token = await this.ensureAccessToken();
    return this.showPicker(token, { ...DEFAULT_OPTIONS, ...options });
  }

  // ─── Script loading ──────────────────────────────────────────────────────────

  private async ensureScriptsLoaded(): Promise<void> {
    await Promise.all([this.loadGapi(), this.loadGsi()]);
  }

  private loadGapi(): Promise<void> {
    if (this.pickerApiLoaded) return Promise.resolve();

    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${PICKER_API_URL}"]`)) {
        const wait = setInterval(() => {
          if (window.gapi) {
            clearInterval(wait);
            this.loadPickerLibrary().then(resolve).catch(reject);
          }
        }, 50);
        return;
      }

      const script = document.createElement('script');
      script.src = PICKER_API_URL;
      script.async = true;
      script.defer = true;
      script.onload = () => this.loadPickerLibrary().then(resolve).catch(reject);
      script.onerror = () => reject(new Error('Failed to load Google API script'));
      document.head.appendChild(script);
    });
  }

  private loadPickerLibrary(): Promise<void> {
    return new Promise((resolve, reject) => {
      window.gapi.load('picker', {
        callback: () => {
          this.pickerApiLoaded = true;
          resolve();
        },
        onerror: () => reject(new Error('Failed to load Google Picker library')),
      });
    });
  }

  private loadGsi(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.oauth2) {
        resolve();
        return;
      }
      if (document.querySelector(`script[src="${GSI_URL}"]`)) {
        const wait = setInterval(() => {
          if (window.google?.accounts?.oauth2) {
            clearInterval(wait);
            resolve();
          }
        }, 50);
        return;
      }

      const script = document.createElement('script');
      script.src = GSI_URL;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Identity Services script'));
      document.head.appendChild(script);
    });
  }

  // ─── OAuth token ─────────────────────────────────────────────────────────────

  /**
   * Returns a valid access token for the drive.file scope.
   * On the first call, triggers a consent popup.
   * Subsequent calls within the token's lifetime reuse the cached token.
   *
   * Rejects with Error('popup_closed') when the user dismisses the consent
   * dialog — the component can catch this and reset loading without an error.
   */
  private ensureAccessToken(): Promise<string> {
    if (this.accessToken) return Promise.resolve(this.accessToken);

    return new Promise((resolve, reject) => {
      if (!this.tokenClient) {
        this.tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: DRIVE_FILE_SCOPE,
          callback: (response: { access_token?: string; error?: string }) => {
            if (response.error || !response.access_token) {
              reject(new Error(response.error ?? 'Token request failed'));
              return;
            }
            this.accessToken = response.access_token;
            // Tokens expire after ~1 h — clear the cache proactively
            setTimeout(() => { this.accessToken = null; }, 55 * 60 * 1000);
            resolve(this.accessToken);
          },
          // Fired when the user closes the consent popup without granting —
          // without this, the component stays in loading state forever.
          error_callback: (err: { type: string }) => {
            reject(new Error(
              err.type === 'popup_closed' ? 'popup_closed' : `OAuth error: ${err.type}`
            ));
          },
        });
      }

      // prompt: '' skips the account-chooser if the user already consented
      (this.tokenClient as TokenClient).requestAccessToken({ prompt: '' });
    });
  }

  // ─── Picker ──────────────────────────────────────────────────────────────────

  private showPicker(
    token: string,
    opts: Required<DrivePickerOptions>,
  ): Promise<DriveFile | null> {
    return new Promise((resolve) => {
      const mimeTypes = opts.mimeTypes.join(',');
      const viewMode  = opts.viewMode === 'list'
        ? window.google.picker.DocsViewMode.LIST
        : window.google.picker.DocsViewMode.GRID;

      const buildView = (): google.picker.DocsView => {
        const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
          .setMimeTypes(mimeTypes)
          .setMode(viewMode)
          .setIncludeFolders(opts.showFolders)
          .setSelectFolderEnabled(false); // folders navigate, never resolve as result

        if (opts.rootFolderId) {
          view.setParent(opts.rootFolderId);
        }

        return view;
      };

      let builder = new window.google.picker.PickerBuilder()
        .setAppId(APP_ID)
        .setOAuthToken(token)
        .setDeveloperKey(API_KEY)
        .setTitle(opts.title)
        .setSize(opts.width, opts.height)
        .addView(buildView());

      if (opts.showSharedWithMe) {
        builder = builder.addView(
          new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
            .setMimeTypes(mimeTypes)
            .setMode(viewMode)
            .setIncludeFolders(opts.showFolders)
            .setSelectFolderEnabled(false)
            .setOwnedByMe(false), // "Shared with me"
        );
      }

      if (opts.showRecent) {
        builder = builder.addView(
          new window.google.picker.DocsView(window.google.picker.ViewId.RECENTLY_PICKED)
            .setMimeTypes(mimeTypes),
        );
      }

      builder
        .setCallback((data: google.picker.ResponseObject) => {
          if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
            const doc = data[google.picker.Response.DOCUMENTS][0];
            resolve({
              id:       doc[google.picker.Document.ID],
              name:     doc[google.picker.Document.NAME],
              mimeType: doc[google.picker.Document.MIME_TYPE],
              url:      doc[google.picker.Document.EMBEDDABLE_URL]
                     ?? doc[google.picker.Document.URL],
            });
          } else if (data[google.picker.Response.ACTION] === google.picker.Action.CANCEL) {
            resolve(null);
          }
        })
        .build()
        .setVisible(true);
    });
  }
}

/** Singleton — ensures the OAuth token and tokenClient survive re-renders. */
export const googleDriveService = new GoogleDriveService();