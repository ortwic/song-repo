<script lang="ts">
    import Autocomplete from 'simple-svelte-autocomplete';
    import CircleOfFifth from "./elements/CircleOfFifth.svelte";

    export let value: string;
</script>

<Autocomplete inputClassName="sm" bind:text={value} minCharactersToSearch={0} showClear={true}>
    <svelte:fragment slot="no-results">
        <div class="popup">
            <CircleOfFifth size={120} bind:selectedKey={value} />
        </div>
    </svelte:fragment>
</Autocomplete>

<style>
    div.popup {
        width: 16em;
    }
</style>