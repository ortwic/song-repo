<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";

    export let title = '';
    export let state: unknown;
    export let options: Array<unknown> = [false, true];
    let index: number;

    const dispatcher = createEventDispatcher();

    onMount(() => index = options.indexOf(state));

    function toggle(event: MouseEvent) {
        index = (index + 1) % options.length;
        state = options[index];
        dispatcher('click', { event, state });
    }
    
    $: selected = state ? 'selected' : 'disabled';
</script>

<button {title} class='sm {selected}'
    on:click={toggle}>
    <slot>{state}</slot>
</button>

<style lang="scss">
    button.selected {
        color: var(--primary);
        border-color: var(--primary);
        background-color: white;
    }
</style>