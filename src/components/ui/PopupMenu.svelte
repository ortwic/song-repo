<script lang="ts">
    import { onDestroy } from 'svelte';
    import { slideFade } from './transition.helper';

    interface Props {
        width?: string | number;
        children?: import('svelte').Snippet;
        position?: 'fixed' | 'absolute';
    }

    let { width = 'auto', children, position = 'fixed' }: Props = $props();
    
    let menu: HTMLDivElement = $state();
    let clientX = $state(0),
        clientY = $state(0),
        offsetWidth: number = $state(),
        offsetHeight: number = $state();

    let left = $derived(
        position === 'fixed' 
            ? (clientX + offsetWidth > window.innerWidth ? `${clientX - offsetWidth}px` : `${clientX}px`) 
            : '0'
    );
    let top = $derived(
        position === 'fixed' 
            ? (clientY + offsetHeight > window.innerHeight ? `${clientY - offsetHeight}px` : `${clientY}px`) 
            : '100%'
    );

    let visible = $state(false);

    export const showPopupMenu = (e?: { clientX: number; clientY: number }) => {
        if (position === 'fixed' && e) {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        visible = true;
        document.addEventListener('click', clickOutside, true);
    };

    export const hide = () => {
        visible = false;
        document.removeEventListener('click', clickOutside, true);
    };

    function clickOutside({ target }: MouseEvent) {
        if (menu && !menu.contains(target as Node)) {
            hide();
        }
    }

    onDestroy(() => {
        if (typeof document !== 'undefined') {
            document.removeEventListener('click', clickOutside, true);
        }
    });
</script>

<div class="container {position}"
    inert={!visible}
    bind:this={menu}
    style:left
    style:top
    style:width={typeof width === 'number' ? `${width}px` : width}
    bind:offsetWidth
    bind:offsetHeight
>
    {#if visible}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div class="popup-menu" onclick={hide}
            in:slideFade={{ duration: 200 }} out:slideFade={{ duration: 200 }}>
            {@render children?.()}
        </div>
    {/if}
</div>

<style lang="scss">
    div.container {
        z-index: 140;

        &.fixed {
            position: fixed;
        }

        &.absolute {
            position: absolute;
        }

        div.popup-menu {
            display: flex;
            flex-direction: column;
            box-shadow: 0.1em 0.1em 0.4em #00000080;
            background: var(--primback);
        }
    }
</style>