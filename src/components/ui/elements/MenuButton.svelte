<script lang="ts">
    import { menu } from "../../../store/menu-context.svelte";

    interface Props {
        disabled?: boolean;
        title?: string;
        className?: string;
        onclick?: (ev: MouseEvent) => void;
        children?: import('svelte').Snippet;
    }

    let {
        disabled = false,
        title = '',
        className = '',
        onclick,
        children
    }: Props = $props();

    function handleClick(ev: MouseEvent) {
        menu.back();
        onclick?.(ev);
    }
</script>

<button {disabled} class={className} {title} onclick={handleClick}>
    {@render children?.()}
</button>