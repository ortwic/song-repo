<script lang="ts">
    import { onMount, tick } from "svelte";
    import { fly, type FlyParams } from "svelte/transition";
    import { cubicOut } from 'svelte/easing';
    import { t } from "svelte-i18n";
    import { swipeable } from "@svelte-put/swipeable";
    import type { DialogAction, DialogSize, DialogType } from "../dialog-context.svelte";
    import Titlebar from "../ui/elements/Titlebar.svelte";

    interface Props {
        size: DialogSize;
        title?: string;
        visible?: boolean;
        type: DialogType;
        header?: import('svelte').Snippet;
        controls?: import('svelte').Snippet;
        children?: import('svelte').Snippet;
        footer?: import('svelte').Snippet;
        onClose: (result: { 
            action?: DialogAction; 
        }) => void;
    }

    let {
        size,
        title = '',
        visible = false,
        type = 'view',
        header,
        controls,
        children,
        footer,
        onClose
    }: Props = $props();

    const flyParams: FlyParams = { duration: 200, easing: cubicOut, x: '100%' };

    onMount(() => {
        const handleKeydown = (event: KeyboardEvent) => {
            if (visible && event.key === 'Escape') {
                handleClose();
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
        if (size === 'auto') {
            const reposition = async () => {
                await tick();
                const { width, height } = node.getBoundingClientRect();
                
                const idealTop = window.innerHeight / 2 - height / 2;
                const maxTop = window.innerHeight - height;
                const top = Math.min(Math.max(0, idealTop), maxTop);
                node.style.top = `${top}px`;
                node.style.left = `calc(50vw - ${width / 2}px)`;
            };

            const resizeObserver = new ResizeObserver(reposition);
            resizeObserver.observe(node);
            reposition();

            return { 
                destroy() {
                    resizeObserver.disconnect();
                }
            };
        }
    }

    function handleClose(event?: Event, action?: DialogAction): void {
        event?.stopPropagation();
        onClose({ action });
    };
</script>

{#if visible}
    <div class='dialog {size}' use:center transition:fly={flyParams}>
        <Titlebar onClose={handleClose}>
            {@render header?.()} {title}
            {#snippet controls()}
                {@render controls?.()}
            {/snippet}
        </Titlebar>
        <div class="swipe-handle"
            title={$t('dialog.swipe-to-close')} 
            aria-hidden="true"
            use:swipeable={{ direction: 'right', threshold: '3rem' }}
            onswipeend={handleClose}>
        </div>
        <div class="dialog-content">
            {@render children?.()}
        </div>
        {@render footer?.()}
        {#if type === 'confirm'}
            <div class="row">
                <button onclick={(e) => handleClose(e, 'confirm')}>
                    { $t('dialog.confirm') }
                </button>
                <button onclick={(e) => handleClose(e)}>
                    { $t('dialog.decline') }
                </button>
            </div>
        {/if}
    </div>
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

    .dialog-content {
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        flex: 1 1 auto;
        min-height: 0;
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