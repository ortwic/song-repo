export interface Dialog<TArgs = DialogArgs, TResult = void> {
    open(args?: TArgs): Promise<TResult>;
}

export interface DialogArgs {
    title?: string;
    message: string;
}

export interface ExceptionDialogArgs extends DialogArgs {
    error: Error;
}

export enum DialogKeys {
    editSong,
    sessionTracker,
    resourceViewer,
    exceptionDialog,
    confirmDialog
}