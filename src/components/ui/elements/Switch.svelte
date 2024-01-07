<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";

    export let title = '';
    export let state: unknown;
    export let options: Array<unknown> = [false, true];
    let index: number;

    const dispatcher = createEventDispatcher();

    onMount(() => index = options.indexOf(state));

    function toggle() {
        index = (index + 1) % options.length;
        state = options[index];
        dispatcher('click', state);
    }
</script>

<button {title} class={state ? 'selected' : ''}
    on:click={toggle}>
    <slot>{state}</slot>
</button>

<style lang="scss">
    button {
        padding: .2rem;
        outline: 0;
        color: var(--primselect);
        border-color: var(--primselect);
        border-radius: 1em;
        text-shadow: unset;
        font-size: small;
        width: 2em;
        height: 2em;
        transition: all .2s ease-in-out;
    }

    button:hover {
        color: var(--text);
        background-color: white;
    }

    button.selected {
        color: var(--primary);
        border-color: var(--primary);
        background-color: white;
    }
</style>