<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { fade } from "svelte/transition";
    import { cubicOut } from 'svelte/easing';
    import Titlebar from "./Titlebar.svelte";
    import type { MenuPages } from "../../model/types";
    
    const dispatch = createEventDispatcher();

    export let size: 'auto' | 'max' | 'full';
    export let target: MenuPages = 'root';
    export let title = '';
</script>

<div class={size}
    in:fade={{ duration: 200, easing: cubicOut }} 
    out:fade={{ duration: 200, easing: cubicOut }}>
    <Titlebar {target} on:close={() => dispatch('closed', false)}>
        <slot name='title'></slot> {title}
    </Titlebar>
    <slot></slot>
    <div class="row">
        <button data-target={target} 
            on:click|stopPropagation={() => dispatch('closed', true)}>
            Confirm
        </button>
        <button data-target={target} 
            on:click|stopPropagation={() => dispatch('closed', false)}>
            Decline
        </button>
    </div>
</div>
{#if size == 'auto'}
<div class='backdrop'></div>
{/if}

<style lang="scss">
@use "../../styles/menu.scss";

@mixin layout {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: fixed;
    width: auto;
    height: auto;
    z-index: 121;
    background-color: var(--primback);
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
    right: menu.$sidebar-width;
    border-right: 1px solid gray;
}

div.auto {
    @include layout; 
    top: 50%;
    left: 50%;
    border: 1px solid gray;
    transform: translate(-50%, -60%);
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