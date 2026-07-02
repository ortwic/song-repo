<script lang="ts">
    import ConfirmDialog from './dialogs/ConfirmDialog.svelte';
    import EditSongDialog from './dialogs/EditSongDialog.svelte';
    import ExceptionDialog from './dialogs/ExceptionDialog.svelte';
    import ResourceViewer from './dialogs/ResourceViewer.svelte';
    import SessionDialog from './dialogs/SessionDialog.svelte';

    interface Props {
        children?: import('svelte').Snippet;
    }
    
    let { children }: Props = $props();
</script>

<ConfirmDialog />
<EditSongDialog />
<SessionDialog />
<ResourceViewer />
<ExceptionDialog />
{@render children?.()}