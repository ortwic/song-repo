<script lang="ts">
    import { t } from "svelte-i18n";
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

{#if isLoading}
    <div id="loader" style:height transition:fade>
    <i class="bx bx-loader-alt bx-spin"></i>
    { $t('start.loading') }
    </div>
{:else}
    {@render children?.()}
{/if}

<style lang="scss">
div#loader {
    position: absolute;
    color: var(--surface);
    font-weight: 500;
    font-style: italic;
    padding: .4em .8em;
    width: 100%;

    &#loader {
        background: linear-gradient(90deg, var(--accent), var(--surface-light), var(--accent), var(--accent));
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
