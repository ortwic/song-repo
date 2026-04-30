<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";

    interface Props {
        title?: string;
        state: unknown;
        options?: Array<unknown>;
        children?: import('svelte').Snippet;
        onToggle?: (state: unknown) => void;
    }

    let {
        title = '',
        state = $bindable(),
        options = [false, true],
        children,
        onToggle
    }: Props = $props();
    let index: number;

    const dispatcher = createEventDispatcher();

    onMount(() => index = options.indexOf(state));

    function toggle(event: MouseEvent) {
        if (dispatcher('click', event, { cancelable: true })) {
            index = (index + 1) % options.length;
            state = options[index];
            onToggle(state);
        }
    }
    
    let selected = $derived(state ? 'selected' : 'disabled');
</script>

<button {title} class='sm clear {selected}' onclick={toggle}>
    {#if children}
        {@render children()}
    {:else}
        {state}
    {/if}
</button>

<style lang="scss">
    button.selected {
        color: var(--primary);
        border-color: var(--primary);
        background-color: white;
    }
</style>