<script lang="ts">
    import { onMount } from "svelte";
    import { errorFromSession } from "../../domain/error-handler";
    import type { ExceptionDialogArgs } from "../dialog-context.svelte";
    import { registerDialog } from "../dialog-context.svelte";
    import DialogBase from "./DialogBase.svelte";

    let error = $state<ExceptionDialogArgs>(null);

    onMount(() => showDialog(errorFromSession()));
    
    registerDialog('ExceptionDialog', showDialog);

    export function showDialog(args: ExceptionDialogArgs): Promise<void> {
        error = args;
        return Promise.resolve();
    }

    function handleClose(): void {
        error = null;
    }
</script>


<DialogBase size="auto" visible={!!error} type="confirm" onClose={handleClose}>
    {#snippet header()}
        <i class="bx bx-alert-triangle"></i>
        {error?.title}
    {/snippet}
    <p>
        {@html error?.body}
    </p>
</DialogBase>

<style>
    p {
        padding: 1em;
        overflow-y: auto;
        overflow-wrap: break-word; 
    }
</style>