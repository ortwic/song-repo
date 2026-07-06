import type { MenuTarget } from "../model/app.types";

export type DialogSize = 'auto' | 'full';
type DialogNames = 'BlogPostDialog'
                 | 'ConfirmDialog' 
                 | 'EditSongDialog' 
                 | 'ExceptionDialog'
                 | 'ResourceViewer' 
                 | 'SessionDialog';
type ShowDialogEventCallback<TArgs = DialogArgs, TResult = void> = (args?: TArgs) => Promise<TResult>;

interface Dialog<TArgs = DialogArgs, TResult = void> {
    open: ShowDialogEventCallback<TArgs, TResult>;
}

export interface DialogArgs {
    title?: string;
    body: string;
    size?: DialogSize;
    target?: MenuTarget;
}

export interface ExceptionDialogArgs extends DialogArgs {
    error: Error;
}

const contextMap = new Map<DialogNames, Dialog<{}, {} | void>>();

export function registerDialog<TArgs extends {}, TResult = void>(
    key: DialogNames, 
    open: ShowDialogEventCallback<TArgs, TResult>
) {
    contextMap.set(key, { open });
}

export function openDialog<TArgs = DialogArgs, TResult = void>(key: DialogNames, args?: TArgs): Promise<TResult> {
    const dialog = contextMap.get(key) as Dialog<TArgs, TResult>;
    if (!dialog?.open) {
        throw new Error(`No dialog registered for ${key.toString()}`);
    }
    return dialog.open(args);
}