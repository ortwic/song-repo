export interface Dialog<TArgs = DialogArgs, TResult = void> {
    open(args?: TArgs): Promise<TResult>;
}

export interface DialogArgs {
    title?: string;
    message: string;
}

export enum DialogKeys {
    editSong,
    resourceViewer,
    confirmDialog
}