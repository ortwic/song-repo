<script lang="ts">
    import ConfirmDialog from "./ConfirmDialog.svelte";
    import type { ExceptionDialogArgs } from "../../model/dialog.model";

    let error = $state<ExceptionDialogArgs>(null);

    export function showDialog(args: ExceptionDialogArgs): void {
        error = args;
    }

    function handleClose(): void {
        error = null;
    }
</script>


<ConfirmDialog size="auto" visible={!!error} onClose={handleClose}>
    {#snippet header()}
        <i class="bx bx-alert-triangle"></i>
        {error?.title}
    {/snippet}
    <p>
        {@html error?.message}
    </p>
</ConfirmDialog>

<style>
    p {
        padding: 1em;
        overflow-y: auto;
        overflow-wrap: break-word; 
    }
</style>