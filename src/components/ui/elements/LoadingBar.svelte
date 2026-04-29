<script lang="ts">
    import { fade } from "svelte/transition";
    interface Props {
        height?: string;
        isLoading?: boolean;
        children?: import('svelte').Snippet;
    }

    let { height = 'auto', isLoading = $bindable(false), children }: Props = $props();

    export function set(value: boolean) {
        isLoading = value;
    }
</script>

<style lang="scss">
div#loader {
    color: white;
    font-size: small;
    font-style: italic;
    width: 100%;
    text-align: center;

    &#loader {
        background: linear-gradient(90deg, var(--primary), var(--primghost), var(--primary), var(--primary));
        background-size: 200% 200%;
        animation: gradient 2s linear infinite;
        transition: opacity 1s;
    }
}

@keyframes gradient {
    0% {
        background-position: 200% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
}
</style>

{#if isLoading}
    <div id="loader" style:height transition:fade>
        {@render children?.()}
    </div>
{/if}
