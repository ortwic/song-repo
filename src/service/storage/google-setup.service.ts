/**
 * Everything Google OAuth / GSI / GAPI.
 *   - Lazy-loads the GSI and Google Picker API scripts exactly once
 *   - Manages the GIS TokenClient lifecycle
 *   - Provides silent token refresh (prompt: 'none') and interactive fallback
 *
 * AuthService   → calls loginWithGoogle() / refreshDriveToken()
 * GoogleDriveService → receives token via setAccessToken(), registered refresher calls back here
 *
 * No Firebase imports. No Picker/Upload logic.
 */

import { GoogleAuthProvider, signInWithPopup, reauthenticateWithPopup } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../base/firebase.setup';
import { googleDriveService } from '../storage/google-drive.service';

const GOOGLE_OAUTH_CLIENT_ID = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID as string;
const GOOGLE_DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file' as const;

const PICKER_API_URL = 'https://apis.google.com/js/api.js';
const GSI_URL = 'https://accounts.google.com/gsi/client';

export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope(GOOGLE_DRIVE_SCOPE);

class GoogleAuthSetupService {
    private gsiReady: Promise<void> | null = null;
    private gapiReady: Promise<void> | null = null;
    private pickerApiLoaded = false;

    constructor() {
        // Both callbacks are injected here so GoogleDriveService has zero knowledge
        // of GSI/GAPI — it only calls back into this service via the registered fns.
        googleDriveService.registerTokenRefresher(() => this.refreshDriveToken());
        googleDriveService.registerScriptLoader(() => this.ensureScriptsLoaded());
    }

    // -------------------------------------------------------------------------
    // Script loading — idempotent, each script loaded at most once
    // -------------------------------------------------------------------------

    /** Resolves once the GSI script is loaded and window.google.accounts.oauth2 is available. */
    ensureGsiLoaded(): Promise<void> {
        if (this.gsiReady) return this.gsiReady;

        this.gsiReady = new Promise<void>((resolve, reject) => {
            if (window.google?.accounts?.oauth2) {
                resolve();
                return;
            }

            if (document.querySelector(`script[src="${GSI_URL}"]`)) {
                // Script tag exists but not yet executed — poll until ready.
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

        return this.gsiReady;
    }

    /** Resolves once the GAPI Picker library is loaded. */
    ensureGapiLoaded(): Promise<void> {
        if (this.gapiReady) return this.gapiReady;

        this.gapiReady = new Promise<void>((resolve, reject) => {
            if (this.pickerApiLoaded) {
                resolve();
                return;
            }

            const loadPickerLibrary = () =>
                new Promise<void>((res, rej) => {
                    window.gapi.load('picker', {
                        callback: () => {
                            this.pickerApiLoaded = true;
                            res();
                        },
                        onerror: () => rej(new Error('Failed to load Google Picker library')),
                    });
                });

            if (document.querySelector(`script[src="${PICKER_API_URL}"]`)) {
                const wait = setInterval(() => {
                    if (window.gapi) {
                        clearInterval(wait);
                        loadPickerLibrary().then(resolve).catch(reject);
                    }
                }, 50);
                return;
            }

            const script = document.createElement('script');
            script.src = PICKER_API_URL;
            script.async = true;
            script.defer = true;
            script.onload = () => loadPickerLibrary().then(resolve).catch(reject);
            script.onerror = () => reject(new Error('Failed to load Google API script'));
            document.head.appendChild(script);
        });

        return this.gapiReady;
    }

    /** Convenience: load both scripts in parallel. */
    async ensureScriptsLoaded(): Promise<void> {
        await Promise.all([this.ensureGsiLoaded(), this.ensureGapiLoaded()]);
    }

    // -------------------------------------------------------------------------
    // Token lifecycle
    // -------------------------------------------------------------------------

    /**
     * Attempts a silent token refresh via GIS (prompt: 'none').
     * Returns the token on success, null if no active Google session exists.
     *
     * Must be called after ensureGsiLoaded() — the onAuthStateChanged handler
     * in AuthService should call ensureGsiLoaded() first to avoid the
     * race condition where GSI is not yet available on page reload.
     */
    async refreshDriveTokenSilently(user: User): Promise<string | null> {
        const providerId = user.providerData.at(0)?.providerId;
        if (providerId === GoogleAuthProvider.PROVIDER_ID) {
            // Guarantee GSI is loaded before touching window.google.accounts.oauth2.
            await this.ensureGsiLoaded();

            return new Promise((resolve) => {
                const config = {
                    client_id: GOOGLE_OAUTH_CLIENT_ID,
                    scope: GOOGLE_DRIVE_SCOPE,
                    use_fedcm_for_prompt: true, // try to suppress internal popup (Chrome 117+)
                    hint: user.email ?? undefined, // skip Account-Chooser
                    callback: (response: { access_token?: string; error?: string }) => {
                        if (response.access_token) {
                            googleDriveService.setAccessToken(response.access_token);
                            resolve(response.access_token);
                        } else {
                            resolve(null); // no active session — caller must trigger interactive flow
                        }
                    },
                    error_callback: () => resolve(null),
                };
                const client = window.google.accounts.oauth2.initTokenClient(config);
                client.requestAccessToken({ prompt: 'none' });
            });
        }

        return Promise.resolve(null);
    }

    /**
     * Full refresh: try silent first, fall back to reauthentication popup.
     * Called by GoogleDriveService when its stored token has expired.
     */
    async refreshDriveToken(): Promise<string> {
        const user = auth.currentUser;
        if (!user) throw new Error('Not authenticated');

        const silent = await this.refreshDriveTokenSilently(user);
        if (silent) return silent;

        // Silent failed → show popup (browser must allow it; only works in response to a user gesture)
        const result = await reauthenticateWithPopup(user, googleProvider);
        const token = GoogleAuthProvider.credentialFromResult(result)?.accessToken;
        if (token) {
            googleDriveService.setAccessToken(token);
            return token;
        }

        throw new Error('No Drive access token in reauthentication result');
    }

    /**
     * Performs the initial Google login via Firebase signInWithPopup and
     * extracts the Drive access token from the credential.
     * Returns both the Firebase User and the Drive access token.
     */
    async signInWithGoogle(): Promise<{ user: import('firebase/auth').User; token: string | undefined }> {
        const result = await signInWithPopup(auth, googleProvider);
        const token = GoogleAuthProvider.credentialFromResult(result)?.accessToken;

        if (token) {
            googleDriveService.setAccessToken(token);
        }

        return { user: result.user, token };
    }
}

/** Singleton — TokenClient and script promises must survive re-renders. */
export const googleAuthSetupService = new GoogleAuthSetupService();

declare namespace google.accounts.oauth2 {
    interface TokenClientConfig {
        use_fedcm_for_prompt?: boolean;
    }
}