<script lang="ts">
    import Autocomplete from 'simple-svelte-autocomplete';
    import CircleOfFifth from "./elements/CircleOfFifth.svelte";

    export let value: string;
</script>

<Autocomplete inputClassName="sm" bind:text={value} minCharactersToSearch={0} showClear={true}>
    <svelte:fragment slot="no-results">
        <CircleOfFifth size={120} bind:selectedKey={value} />
    </svelte:fragment>
</Autocomplete>