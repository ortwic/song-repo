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
    
    function clicked() {
        push(href);
    }
</script>

{#if !self}
<div class="row">
    <button data-close class={className} {title} onclick={clicked}>
        {@render children?.()}
    </button>
</div>
{/if}