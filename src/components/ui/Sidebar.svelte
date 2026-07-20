<script lang="ts">
    import '../../styles/menu.scss';
    import { t } from 'svelte-i18n';
    import { location, push } from 'svelte-spa-router';
    import { slide } from 'svelte/transition';
    import { swipeable } from '@svelte-put/swipeable';
    import { menuContext } from '../../store/menu-context.svelte';
    import { currentUser } from '../../service/user/auth.service';
    import NavButton from './elements/NavButton.svelte';
    import Titlebar from './elements/Titlebar.svelte';

    interface Props {
        children?: import('svelte').Snippet;
        lower?: import('svelte').Snippet;
        footer?: import('svelte').Snippet;
        onclose: () => void;
    }

    const offset = window.innerWidth - document.querySelector('main').clientWidth;

    let { children, lower, footer, onclose }: Props = $props();

    function hide() {
        onclose();
    }
</script>

<aside
    use:swipeable={{ direction: 'right', threshold: '1rem' }}
    onswipeend={hide}
    transition:slide={{ duration: 200, axis: 'x' }}
    style:right="{menuContext.offsetWidth}px"
>
    <Titlebar target="hidden">
        {#snippet controls()}
            {#if $location !== '/'}
            <button class="titlebar-button" data-close title={$t('start.hello')} onclick={() => push('/')}>
                {#if $currentUser}
                <i class="item bx bx-user-circle"></i>
                {:else}
                <i class="item bx bx-world"></i>
                {/if}
            </button>
            {/if}
            <NavButton className="titlebar-button" title={$t('menu.repo')} href='/songs'>
                <i class="item bx bxs-playlist"></i>
            </NavButton>
            <NavButton className="titlebar-button" title={ $t('menu.snippets') } href='/snippets'>
                <i class="bx bx-bulb"></i>
            </NavButton> 
            <NavButton className="titlebar-button" title={$t('menu.howto')} href='/blog'>
                <i class="item bx bx-book-open"></i>
            </NavButton>
            <NavButton className="titlebar-button" title={$t('menu.events')} href='/events'>
                <i class="item bx bx-calendar"></i>
            </NavButton>
            <NavButton className="titlebar-button" title={$t('settings.title')} href='/settings'>
                <i class="item bx bx-cog"></i>
            </NavButton>
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
        @include vars.surface-blur;
        display: flex;
        flex-direction: column;
        position: fixed;
        top: 0; //2.2em;
        right: 0;
        bottom: 0;
        width: vars.$sidebar-width;
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
            text-shadow: var(--shadow-text);
            min-height: 2.2em;
            user-select: none;
        }
    }
</style>
