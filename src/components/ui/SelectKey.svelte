<script lang="ts">
    import Autocomplete from 'simple-svelte-autocomplete';
    import CircleOfFifth from "./elements/CircleOfFifth.svelte";

    interface Props {
        value: string;
    }

    let { value = $bindable() }: Props = $props();
</script>

<Autocomplete inputClassName="sm" bind:text={value} minCharactersToSearch={0} showClear={true}
    searchFunction={(v) => [v]}>
    {#snippet item()}
    
            <div class="popup">
                <CircleOfFifth size={120} bind:selectedKey={value} />
            </div>
        
    {/snippet}
</Autocomplete>

<style>
    div.popup {
        width: 16em;
    }
</style>