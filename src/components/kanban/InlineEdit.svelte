<script lang="ts">
    import TextField from '@smui/textfield'

    export let editing = false;
    export let placeholder: string;
    export let value: string | number;
    export let type: "text" | "select" = "text";

    const edit = () => editing = true;
</script>

<span>
    {#if editing}
        {#if type === "text"}
            <TextField bind:value={value} label={placeholder} />
        {/if}
    {:else}
        <button on:click={edit}>{value}</button>
    {/if}
</span>

<style>
    button {
        padding: 0;
        border: 0;
        background-color: transparent;
    }
</style>