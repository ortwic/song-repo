<script lang='ts'>
    import '../../styles/menu.scss';
    import { push } from 'svelte-spa-router';
    import { slide } from 'svelte/transition';
    import Titlebar from './elements/Titlebar.svelte';

  interface Props {
    title?: string;
    children?: import('svelte').Snippet;
    lower?: import('svelte').Snippet;
    footer?: import('svelte').Snippet;
  }

  let {
    title = '',
    children,
    lower,
    footer
  }: Props = $props();
</script>

<aside in:slide={{ duration: 200, axis: 'x' }} out:slide={{ duration: 200, axis: 'x' }} >
    <Titlebar target='hidden'>
        <button class="clear" data-close onclick={() => push('/')}>
            {title}
        </button>
    </Titlebar>
    <section>
        {@render children?.()}
    </section>
    <footer class="menu">
        {@render lower?.()}
        <div class="info">
            {@render footer?.()}
        </div>
    </footer>
</aside>

<style lang="scss">
@use "../../styles/vars.scss";

aside {
    @include vars.fancy-w7-bg;
    display: flex;
    flex-direction: column;
    position: fixed;
    right: 0;
    width: vars.$sidebar-width;
    height: 100%;
    z-index: 100;
    box-shadow: 0 0 2em #00000080;

    button {
        padding: 0;
        font-style: italic;
        color: inherit;

        &:hover {
            text-decoration: underline;
        }
    }

    section {
        text-align: center;
        flex-grow: 1;
        overflow-y: auto;
    }

    div.info {
        color: whitesmoke;
        background-color: #80808060;
        padding-top: .4em;
        font-size: small;
        text-align: center;
        text-shadow: 1px 1px 0 gray;
        min-height: 2.2em;
        user-select: none;
    }
}
</style>
  