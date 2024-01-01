<script lang='ts'>
    import '../../styles/menu.scss';
    import { slide } from 'svelte/transition';
    import Titlebar from './elements/Titlebar.svelte';

    export let title = '';
</script>

<aside in:slide={{ duration: 200, axis: 'x' }} out:slide={{ duration: 200, axis: 'x' }} >
    <Titlebar target="root">
        <slot name="title">
            {title}
        </slot>    
    </Titlebar>
    <section>
        <slot></slot>
    </section>
    <footer class="menu">
        <slot name="lower"></slot>
        <div class="info">
            <slot name="footer"></slot>
        </div>
    </footer>
</aside>

<style lang="scss">
@use "../../styles/vars.scss";

aside {
    display: flex;
    flex-direction: column;
    position: fixed;
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
    }
}
</style>
  