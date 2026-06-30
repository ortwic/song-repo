<script lang="ts">
    import { fade } from "svelte/transition";
    import { cubicOut } from 'svelte/easing';
    import { t } from "svelte-i18n";
    import Portal from "svelte-portal";
    import Titlebar from "../ui/elements/Titlebar.svelte";
    import type { MenuTarget } from "../../model/types";
    import { onMount } from "svelte";

    interface Props {
        size: 'auto' | 'max' | 'full';
        target?: MenuTarget;
        title?: string;
        visible?: boolean;
        header?: import('svelte').Snippet;
        children?: import('svelte').Snippet;
        footer?: import('svelte').Snippet;
        onClose: (confirmed: boolean) => void;
    }

    let {
        size,
        target = 'hidden',
        title = '',
        visible = false,
        header,
        children,
        footer,
        onClose
    }: Props = $props();

    onMount(() => {
        const handleKeydown = (event: KeyboardEvent) => {
            if (visible && event.key === 'Escape') {
                onClose(false);
            }
        };

        document.addEventListener('keydown', handleKeydown);
        return () => document.removeEventListener('keydown', handleKeydown);
    });

    function confirm(event: Event) {
        event.stopPropagation();
        onClose(true);
    }

    function decline(event: Event) {
        event.stopPropagation();
        onClose(false);
    }
</script>

{#if visible}
    <Portal>
        <div class='dialog {size}'
        in:fade={{ duration: 200, easing: cubicOut }} 
        out:fade={{ duration: 200, easing: cubicOut }}>
        <Titlebar {target} onClose={() => onClose(false)}>
            {@render header?.()} {title}
        </Titlebar>
        {@render children?.()}
        {#if footer}
            {@render footer()}
        {:else}
            <div class="row">
                <button data-target={target} onclick={confirm}>
                    { $t('dialog.confirm') }
                </button>
                <button data-target={target} onclick={decline}>
                    { $t('dialog.decline') }
                </button>
            </div>
        {/if}
        </div>
    </Portal>
    {#if size == 'auto'}
    <div class='backdrop'></div>
    {/if}
{/if}

<style lang="scss">
@use "../../styles/vars.scss";

@mixin layout {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: fixed;
    width: auto;
    height: auto;
    z-index: 121;
}

div.dialog {
    @include vars.surface-blur;

    min-width: 22.5em;
    max-width: 100vw;
    max-height: 100vh;
    background-color: var(--bg-t);

    div.row button {
        background-color: var(--surface-t);
    }
}

div.full {
    @include layout;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 130;
}

div.max {
    @include layout;
    top: 0;
    left: 0;
    bottom: 0;
    right: vars.$sidebar-width;
    border-right: 1px solid gray;
}

div.auto {
    @include layout; 
    top: 50%;
    left: 50%;
    border: 1px solid gray;
    transform: translate(-50%, -50%);
    box-shadow: .2em .2em .8em #00000080;
}

div.backdrop {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 120;
    background-color: #80808020;
    backdrop-filter: grayscale(.5);
}
</style>