<script lang="ts">
    import { onDestroy, tick } from 'svelte';
    import { slideFade } from './transition.helper';
    import { portal } from 'svelte-portal';

    interface Props {
        width?: string | number;
        children?: import('svelte').Snippet;
    }

    let { width = 'auto', children }: Props = $props();
    let menu: HTMLDivElement = $state();
    let clientX = $state(0),
        clientY = $state(0),
        offsetWidth: number = $state(),
        offsetHeight: number = $state();
    let left: string | number = $derived(
        clientX + offsetWidth > window.innerWidth ? `${clientX - offsetWidth}px` : `${clientX}px`
    );
    let top: string | number = $derived(
        clientY + offsetHeight > window.innerHeight ? `${clientY - offsetHeight}px` : `${clientY}px`
    );
    let visible = $state(false);

    onDestroy(() => {
        document.removeEventListener('click', clickOutside, true);
    });

    document.addEventListener('click', clickOutside, true);

    export const showPopupMenu = (e: { clientX: number; clientY: number }) => {
        clientX = e.clientX;
        clientY = e.clientY;
        visible = true;
    };

    function clickOutside({ target }) {
        if (!menu.contains(target)) {
            hide();
        }
    }

    function hide() {
        visible = false;
    }
</script>

<div
    use:portal={document.body}
    class="container"
    aria-hidden="true"
    bind:this={menu}
    style:left
    style:top
    style:width
    bind:offsetWidth
    bind:offsetHeight
    onclick={hide}
>
    {#if visible}
        <div class="popup-menu" in:slideFade={{ duration: 200 }} out:slideFade={{ duration: 200 }}>
            {@render children?.()}
        </div>
    {/if}
</div>

<style lang="scss">
    div.container {
        position: fixed;
        z-index: 140;

        div.popup-menu {
            display: flex;
            flex-direction: column;
            box-shadow: 0.1em 0.1em 0.4em #00000080;
        }
    }
</style>
