<script lang="ts">
    import { setContext } from 'svelte';
    import ConfirmDialog from './dialogs/ConfirmDialog.svelte';
    import EditSongDialog from './dialogs/EditSongDialog.svelte';
    import SessionDialog from './dialogs/SessionDialog.svelte';
    import ResourceViewer from './dialogs/ResourceViewer.svelte';
    import { type DialogArgs, DialogKeys, type Dialog } from '../model/dialog.model';
    import type { UserSession } from '../model/session.model';
    import type { Song, UserSong } from '../model/song.model';
    import { createDeferred, type DeferredResult } from '../utils/promise.helper';

    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();

    let editSong: EditSongDialog = $state();
    setContext<Dialog<Partial<UserSong>, UserSong>>(DialogKeys.editSong, {
        open: (args?: Partial<UserSong>) => editSong.showDialog(args)
    });

    let sessionTracker: SessionDialog = $state();
    setContext<Dialog<UserSong, UserSession>>(DialogKeys.sessionTracker, {
        open: (args?: UserSong) => sessionTracker.showDialog(args)
    });

    let resourceViewer: ResourceViewer = $state();
    setContext<Dialog<Song>>(DialogKeys.resourceViewer, {
        open: (args?: Song) => resourceViewer.showDialog(args)
    });
    
    let confirmDialogVisible = $state(false);
    let confirmDialogTitle = $state<string>();
    let confirmDialogMessage = $state<string>();
    let confirmDialogResult: DeferredResult<boolean> = null;
    setContext<Dialog<DialogArgs, boolean>>(DialogKeys.confirmDialog, {
        open: (args?: DialogArgs) => showConfirmDialog(args)
    });

    function showConfirmDialog(args: DialogArgs) {
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

<EditSongDialog bind:this={editSong} />

<SessionDialog bind:this={sessionTracker} />

<ResourceViewer bind:this={resourceViewer} />

<ConfirmDialog size="auto" 
    title={confirmDialogTitle} 
    visible={confirmDialogVisible}
    onClose={hideConfirmDialog}
>
    <p class="center">{confirmDialogMessage}</p>
</ConfirmDialog>

{@render children?.()}
