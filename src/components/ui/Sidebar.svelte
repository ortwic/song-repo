<script lang='ts'>
    import '../../styles/menu.scss';
    import { slide } from 'svelte/transition';
    import Titlebar from './Titlebar.svelte';

    export let title = '';
    export let footer = '';
</script>

<aside in:slide={{ duration: 200, axis: 'x' }} out:slide={{ duration: 200, axis: 'x' }} >
    <Titlebar target="root">{title}</Titlebar>
    <section>
        <slot></slot>
    </section>
    <footer class="menu">
        <slot name="footer"></slot>
        <div class="info">
            {footer}
        </div>
    </footer>
</aside>

<style lang="scss">
aside {
    display: flex;
    flex-direction: column;
    position: absolute;
    right: 0;
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
    }
}
</style>
  