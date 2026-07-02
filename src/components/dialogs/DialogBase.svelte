<script lang="ts">
    import { onMount, tick } from "svelte";
    import { fly, type FlyParams } from "svelte/transition";
    import { cubicOut } from 'svelte/easing';
    import { t } from "svelte-i18n";
    import Portal from "svelte-portal";
    import { swipeable } from "@svelte-put/swipeable";
    import type { MenuTarget } from "../../model/types";
    import type { DialogSize } from "../dialog-context.svelte";
    import Titlebar from "../ui/elements/Titlebar.svelte";

    interface Props {
        size: DialogSize;
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

    const flyParams: FlyParams = { duration: 200, easing: cubicOut, x: '100%' };

    onMount(() => {
        const handleKeydown = (event: KeyboardEvent) => {
            if (visible && event.key === 'Escape') {
                onClose(false);
            }
        };

        document.addEventListener('keydown', handleKeydown);
        return () => document.removeEventListener('keydown', handleKeydown);
    });

    /**
     * Alternative to transform since fly does use transform internally
     * @param node
     */
    function center(node: HTMLElement) {
        if (size == 'auto') {
            const update = async () => {
                await tick();
                const { width, height } = node.getBoundingClientRect();
                node.style.top = `calc(50vh - ${height / 2}px)`;
                node.style.left = `calc(50vw - ${width / 2}px)`;
            };

            update();

            return { update };
        }
    }

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
        <div class='dialog {size}' use:center transition:fly={flyParams}>
            <Titlebar {target} onClose={() => onClose(false)}>
                {@render header?.()} {title}
            </Titlebar>
            <div class="swipe-handle"
                title={$t('dialog.swipe-to-close')} 
                aria-hidden="true"
                use:swipeable={{ direction: 'right', threshold: '3rem' }}
                onswipeend={() => onClose(false)}>
            </div>
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

    .swipe-handle {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 1.5rem;
        z-index: 1212;
        cursor: grab;
    }

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
    border-right: 1px solid var(--border);
}

div.auto {
    @include layout; 
    top: 50%;
    left: 50%;
    border: 1px solid gray;
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