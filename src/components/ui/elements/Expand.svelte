<script lang="ts">
    import { t } from 'svelte-i18n';
    import collapse from 'svelte-collapse';

    interface Props {
        open?: boolean;
        icon?: string;
        title?: string;
        duration?: number;
        easing?: string;
        onToggle?: (state: boolean) => void;
        children?: import('svelte').Snippet;
    }

    let {
        open = $bindable(true),
        icon = '',
        title = '',
        duration = 0.2,
        easing = 'ease',
        onToggle,
        children
    }: Props = $props();

    function handleToggle() {
        open = !open;
        onToggle?.(open);
    }
</script>

<div class="card" class:open aria-expanded={open}>
    <span class="small card-header grid" class:open={open}>
        <button class="clear" onclick={handleToggle}
            aria-expanded={open}
            title="{open ? $t('common.collapse') : $t('common.expand')}">
            <i class="bx bx-{open ? 'down' : 'right'}-arrow"></i>
        </button>
        <span class="no-wrap">
            {#if icon} <i class="bx {icon}"></i> {/if}
            {title}
        </span>
    </span>

    <div class="card-body" use:collapse={{ open, duration, easing }}>
        {@render children?.()}
    </div>
</div>

<style lang="scss">
    .card-header {
        cursor: pointer;
        user-select: none;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 0.5em;
        transition: border-bottom 0.2s ease-in-out;

        &.open {
            border-bottom: 1px solid var(--surface-mid);
        }

        button {
            padding: 0.5em;
        }
    }

    .grid {
        display: grid;
        grid-template-columns: auto 1fr;
    }
</style>