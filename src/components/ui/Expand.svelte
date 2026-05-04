<script lang="ts">
    import { t } from 'svelte-i18n';
    import collapse from 'svelte-collapse';

    interface Props {
        open?: boolean;
        title?: string;
        duration?: number;
        easing?: string;
        onOpen?: () => void;
        onClose?: () => void;
        children?: import('svelte').Snippet;
    }

    let {
        open = true,
        title = '',
        duration = 0.2,
        easing = 'ease',
        onOpen,
        onClose,
        children
    }: Props = $props();

    function handleToggle() {
        open = !open;
        open ? onOpen?.() : onClose?.();
    }
</script>

<div class="card" class:open aria-expanded={open}>
    <span class="small card-header grid">
        <button class="clear" onclick={handleToggle}
            aria-expanded={open}
            title="{open ? $t('common.collapse') : $t('common.expand')}">
            <i class="bx bx-{open ? 'down' : 'right'}-arrow"></i>
        </button>
        {title}
    </span>

    <div class="card-body" use:collapse={{ open, duration, easing }}>
        {@render children?.()}
    </div>
</div>

<style lang="scss">
    .card-header {
        cursor: pointer;
        user-select: none;
        border-bottom: 1px solid var(--primary);
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 0.5em;

        button {
            padding: 0.5em;
        }
    }

    .grid {
        display: grid;
        grid-template-columns: auto 1fr;
    }
</style>