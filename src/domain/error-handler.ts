import { type ExceptionDialogArgs } from "../components/dialog-context.svelte";

const storageKey = 'exceptionDialog'.toString();

export function setSessionError(error: ExceptionDialogArgs): void {
    sessionStorage.setItem(storageKey, JSON.stringify(error));
}

export function errorFromSession(): ExceptionDialogArgs {
    const error = JSON.parse(sessionStorage.getItem(storageKey) || 'null') as ExceptionDialogArgs;
    if (error) {
        sessionStorage.removeItem(storageKey);
    }
    return error;
}