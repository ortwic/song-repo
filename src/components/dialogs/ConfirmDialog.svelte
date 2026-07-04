<script lang="ts">
    import DialogBase from '../dialogs/DialogBase.svelte';
    import type { DialogArgs } from '../dialog-context.svelte';
    import { registerDialog } from '../dialog-context.svelte';
    import { interceptInternalLinks } from '../actions/intercept-internal-links';
    import { createDeferred, type DeferredResult } from '../../utils/promise.helper';

    let props = $state<DialogArgs | undefined>();
    let result: DeferredResult<boolean> | undefined;

    registerDialog<DialogArgs, boolean>('ConfirmDialog', showDialog);

    export function showDialog(args: DialogArgs) {
        props = args;
        result = createDeferred<boolean>();
        return result.promise;
    }

    function handleClose(confirmed: boolean) {
        props = undefined;
        result.resolve(confirmed);
    }
</script>

{#if props}
<DialogBase 
    visible={props !== undefined} 
    title={props.title ? `${props.title} | Song-Repo` : 'Song-Repo'} 
    size={props.size ?? 'auto'} 
    target={props.target}
    onClose={handleClose}
>
    <div class="body" use:interceptInternalLinks>
        {@html props.body}
    </div>
</DialogBase>
{/if}

<style>
    .body {
        padding: 1em;
        overflow-y: auto;
    }
</style>