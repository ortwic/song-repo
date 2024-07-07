<script lang="ts">
    import { location, push } from "svelte-spa-router";

    export let href: string;
    export let title = '';
    export let className = '';

    const self = $location.startsWith(href);
    
    function clicked() {
        push(href);
    }
</script>

{#if !self}
<div class="row">
    <button data-close class={className} {title} on:click={clicked}>
        <slot></slot>
    </button>
</div>
{/if}