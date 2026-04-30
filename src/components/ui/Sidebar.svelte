<script lang="ts">
    import '../../styles/menu.scss';
    import { t } from 'svelte-i18n';
    import { push } from 'svelte-spa-router';
    import { slide } from 'svelte/transition';
    import { swipeable } from '@svelte-put/swipeable';
    import Titlebar from './elements/Titlebar.svelte';

    interface Props {
        title?: string;
        children?: import('svelte').Snippet;
        lower?: import('svelte').Snippet;
        footer?: import('svelte').Snippet;
        onclose: () => void;
    }

    let { title = '', children, lower, footer, onclose }: Props = $props();

    function hide() {
        onclose();
    }
</script>

<aside
    use:swipeable={{ direction: 'right', threshold: '1rem' }}
    onswipeend={hide}
    in:slide={{ duration: 200, axis: 'x' }}
    out:slide={{ duration: 200, axis: 'x' }}
>
    <Titlebar target="hidden">
        {title}
        {#snippet controls()}
            <button class="titlebar-button" title={$t('settings.title')} data-close onclick={() => push('/settings')}>
                <i class="item bx bx-cog"></i>
            </button>
        {/snippet}
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
    @use '../../styles/vars.scss';

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
        user-select: none;

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
            padding-top: 0.4em;
            font-size: small;
            text-align: center;
            text-shadow: 1px 1px 0 gray;
            min-height: 2.2em;
            user-select: none;
        }
    }
</style>
