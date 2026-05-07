<script lang="ts">
    import { setContext } from 'svelte';
    import EditSongDialog from './dialogs/EditSongDialog.svelte';
    import type { Dialog } from '../model/dialog.model';
    import type { UserSong } from '../model/song.model';
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();

    let editSong: EditSongDialog = $state();

    setContext<Dialog<Partial<UserSong>>>('editsong-dialog', {
        open: (song?: Partial<UserSong>) => editSong.showDialog(song)
    });
</script>

<EditSongDialog bind:this={editSong} />

{@render children?.()}
