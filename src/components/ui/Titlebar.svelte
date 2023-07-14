<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import type { MenuPages } from "../../model/types";
    
    const dispatch = createEventDispatcher();

    export let target: MenuPages = 'root';
</script>

<div>
    <span><slot></slot></span>
    <button data-target={target} class="close" on:click={() => dispatch('close')}>✕</button>
</div>

<style lang="scss">
    div {
        display: flex;
        justify-content: space-between;
        color: var(--primback);
        background: linear-gradient(to right, var(--primdark) 20%, var(--primary));
        white-space: nowrap;
        font-weight: 500;
        max-height: 2.2em;

        span {
            display: inline-block;
            flex-grow: 1;
            font-style: italic;
            padding: .4em .8em;
        }
    
        button.close {
            color: inherit;
            background-color: transparent;
            box-shadow: unset;
            padding: 0 1.3em;
            border: 0;
            outline: 0;
            max-width: 4em;
            max-height: inherit;
            transition: all .2s ease-in-out;
            font-size: smaller;

            &:hover {
                background-color: #F0F0F040;
            }
        }
    }
</style>