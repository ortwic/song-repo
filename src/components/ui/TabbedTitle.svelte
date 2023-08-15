<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    export let tabs: Record<string, string>;
    export let active = undefined;

    type Pages = keyof typeof tabs;

    function change(tab: Pages) {
        active = tab;
        dispatch('tabChange', tab);
    }
</script>

<div class="tabs">
    {#each Object.keys(tabs) as key}
        <button class={ key === active ? 'active' : 'normal' } on:click={() => change(key)}>
            { tabs[key] }
        </button>
    {/each}
</div>

<style lang="scss">
    div.tabs button {
        color: var(--primback);
        border: 0;
        box-shadow: unset;
        margin-right: 8px;
        
        &.normal {
            background-color: #E0E0E040;
            padding-bottom: 1px;
            border-bottom-left-radius: unset;
            border-bottom-right-radius: unset;
        }
        
        &.active {
            color: var(--primary);
        }

        &:focus {
            outline: 0;
        }
    }
</style>