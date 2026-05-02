<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";

    interface Props {
        title?: string;
        icon?: string;
        state: unknown;
        options?: Array<unknown>;
        onToggle?: (state: unknown) => void;
    }

    let {
        title = '',
        icon = '',
        state = $bindable(),
        options = [false, true],
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
</script>

<button {title} 
    class='switch-icon' 
    class:selected={state} 
    class:disabled={!state} 
    onclick={toggle}>
    <i class="bx {icon ?? 'bx-check'}"></i>
</button>
