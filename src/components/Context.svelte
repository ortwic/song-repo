<script lang="ts">
    import BlogPostDialog from './dialogs/BlogPostDialog.svelte';
    import ConfirmDialog from './dialogs/ConfirmDialog.svelte';
    import EditSongDialog from './dialogs/EditSongDialog.svelte';
    import ExceptionDialog from './dialogs/ExceptionDialog.svelte';
    import ResourceViewer from './dialogs/ResourceViewer.svelte';
    import SessionDialog from './dialogs/SessionDialog.svelte';
    import SnippetDialog from './dialogs/SnippetDialog.svelte';

    interface Props {
        children?: import('svelte').Snippet;
    }
    
    let { children }: Props = $props();
</script>

<BlogPostDialog />
<ConfirmDialog />
<EditSongDialog />
<ExceptionDialog />
<ResourceViewer />
<SessionDialog />
<SnippetDialog />
{@render children?.()}