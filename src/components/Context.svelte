<script lang="ts">
    import { onMount, setContext } from 'svelte';
    import ConfirmDialog from './dialogs/ConfirmDialog.svelte';
    import EditSongDialog from './dialogs/EditSongDialog.svelte';
    import SessionDialog from './dialogs/SessionDialog.svelte';
    import ResourceViewer from './dialogs/ResourceViewer.svelte';
    import ExceptionDialog from './dialogs/ExceptionDialog.svelte';
    import { errorFromSession } from '../domain/error-handler';
    import type { SongEntity } from '../domain/song.entity';
    import { type DialogArgs, DialogKeys, type Dialog } from '../model/dialog.model';
    import type { UserSession } from '../model/session.model';
    import type { Song, UserSong } from '../model/song.model';
    import { createDeferred, type DeferredResult } from '../utils/promise.helper';

    interface Props {
        children?: import('svelte').Snippet;
    }
    
    let { children }: Props = $props();

    let exceptionDialog: ExceptionDialog | undefined = $state();
    let editSongDialog: EditSongDialog | undefined = $state();
    let sessionTracker: SessionDialog | undefined = $state();
    let resourceViewer: ResourceViewer | undefined = $state();

    let confirmDialogVisible = $state(false);
    let confirmDialogTitle = $state<string>();
    let confirmDialogMessage = $state<string>();
    let confirmDialogResult: DeferredResult<boolean> | undefined;

    onMount(() => {
        exceptionDialog.showDialog(errorFromSession());
        registerDialog<Partial<UserSong>, UserSong>(DialogKeys.editSong, editSongDialog);
        registerDialog<SongEntity, UserSession>(DialogKeys.sessionTracker, sessionTracker);
        registerDialog<Song, void>(DialogKeys.resourceViewer, resourceViewer);
        registerDialog<DialogArgs, boolean>(DialogKeys.confirmDialog, { showDialog });
    });

    function registerDialog<TArgs, TResult = void>(
        key: DialogKeys, 
        dialog: { showDialog: Dialog<TArgs, TResult>['open'] }
    ) {
        setContext<Dialog<TArgs, TResult>>(key, { open: (args) => dialog.showDialog(args) });
    }

    function showDialog(args: DialogArgs) {
        confirmDialogTitle = args.title ? `${args.title} | Song-Repo` : 'Song-Repo';
        confirmDialogMessage = args.message;
        confirmDialogVisible = true;
        confirmDialogResult = createDeferred<boolean>();
        return confirmDialogResult.promise;
    }

    function hideConfirmDialog(confirmed: boolean) {
        confirmDialogVisible = false;
        confirmDialogMessage = undefined;
        confirmDialogTitle = undefined;
        confirmDialogResult.resolve(confirmed);
    }
</script>

<EditSongDialog bind:this={editSongDialog} />
<SessionDialog bind:this={sessionTracker} />
<ResourceViewer bind:this={resourceViewer} />
<ExceptionDialog bind:this={exceptionDialog} />
<ConfirmDialog
    size="auto"
    title={confirmDialogTitle}
    visible={confirmDialogVisible}
    onClose={hideConfirmDialog}
>
    <p class="center">{confirmDialogMessage}</p>
</ConfirmDialog>
{@render children?.()}