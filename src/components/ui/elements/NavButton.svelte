<script lang="ts">
    import { location, push } from "@keenmate/svelte-spa-router";
    import MenuButton from "./MenuButton.svelte";

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

    const self = $derived(location().startsWith(href));
</script>

{#if !self}
<MenuButton {title} className={className} onclick={() => push(href)}>
    {@render children?.()}
</MenuButton>
{/if}