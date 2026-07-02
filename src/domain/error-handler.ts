import { type ExceptionDialogArgs } from "../components/dialog-context.svelte";

const SESSION_ERROR_KEY = 'song-repo_error';

export function setSessionError(error: ExceptionDialogArgs): void {
    sessionStorage.setItem(SESSION_ERROR_KEY, JSON.stringify(error));
}

export function errorFromSession(): ExceptionDialogArgs {
    const error = JSON.parse(sessionStorage.getItem(SESSION_ERROR_KEY) || 'null') as ExceptionDialogArgs;
    if (error) {
        sessionStorage.removeItem(SESSION_ERROR_KEY);
    }
    return error;
}