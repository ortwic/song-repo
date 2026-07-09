<script lang="ts">
    import DialogBase from '../dialogs/DialogBase.svelte';
    import type { DialogAction, DialogArgs } from '../dialog-context.svelte';
    import { registerDialog } from '../dialog-context.svelte';
    import { interceptInternalLinks } from '../actions/intercept-internal-links';
    import { createDeferred, type DeferredResult } from '../../utils/promise.helper';

    let props = $state<DialogArgs | undefined>();
    let result: DeferredResult<DialogAction> | undefined;

    registerDialog<DialogArgs, DialogAction>('ConfirmDialog', showDialog);

    export function showDialog(args: DialogArgs) {
        props = args;
        result = createDeferred<DialogAction>();
        return result.promise;
    }

    function done(action: DialogAction) {
        props = undefined;
        result.resolve(action);
    }
</script>

{#if props}
<DialogBase 
    visible={props !== undefined} 
    title={props.title ? `${props.title} | ${import.meta.env.PACKAGE_NAME}` : import.meta.env.PACKAGE_NAME} 
    size={props.size ?? 'auto'} 
    type='confirm'
    target={props.target}
    onClose={({ action }) => done(action)}
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