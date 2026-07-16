<script lang="ts">
    import { location, push } from "svelte-spa-router";

    interface Props {
        href: string;
        title?: string;
        className?: string;
        children?: import('svelte').Snippet;
    }

    let {
        href,
        title = '',
        className = '',
        children
    }: Props = $props();

    const self = $location.startsWith(href);
</script>

{#if !self}
<button data-close class={className} {title} onclick={() => push(href)}>
    {@render children?.()}
</button>
{/if}