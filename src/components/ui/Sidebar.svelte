<script lang='ts'>
    import '../../styles/menu.scss';
    import { slide } from 'svelte/transition';
    import Titlebar from './Titlebar.svelte';
    import AdvanceTable from '../table/AdvanceTable.svelte';

    export let title = '';
    export let footer = '';
    let counter = 0;
</script>

<aside in:slide={{ duration: 200, axis: 'x' }} out:slide={{ duration: 200, axis: 'x' }} >
    <Titlebar target="root">{title}</Titlebar>
    <section>
        <slot></slot>
    </section>
    <footer class="menu">
        {#if counter >= 5e5 || import.meta.env.DEV}
        <AdvanceTable />
        {/if}
        <slot name="footer"></slot>
        <div class="info">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div on:click={() => counter++} on:contextmenu={() => counter = counter > 5 ? 5e5 : 0}></div>
            {footer}
        </div>
    </footer>
</aside>

<style lang="scss">
@use "../../styles/vars.scss";

aside {
    display: flex;
    flex-direction: column;
    position: absolute;
    right: 0;
    width: vars.$sidebar-width;
    height: 100%;
    z-index: 100;
    background-color: var(--primback);
    box-shadow: 0 0 2em #00000080;

    section {
        text-align: center;
        flex-grow: 1;
        overflow-y: auto;
    }

    div.info {
        color: whitesmoke;
        background-color: silver;
        padding-top: .4em;
        font-size: small;
        text-align: center;
        text-shadow: 1px 1px 0 gray;
        min-height: 2.2em;
        user-select: none;

        div {
            position: absolute;
            right: 0;
            width: 1.5em;
            height: 1.5em;
        }
    }
}
</style>
  