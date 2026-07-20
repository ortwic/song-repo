<script lang="ts">
    import { get } from 'svelte/store';
    import { swipeable } from '@svelte-put/swipeable';
    import { menuContext } from '../../../store/menu-context.svelte';
    import { currentMenu } from '../../../store/app.store';

    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();

    function toggle() {
        if (get(currentMenu) === 'hidden') {
            currentMenu.set('dynamic');
        } else {
            currentMenu.set('hidden');
        }
    }

    function handleDataClose(ev: SubmitEvent) {
        ev.preventDefault();

        if (ev.submitter.getAttribute('data-close') !== null) {
            currentMenu.set('hidden');
        }
    }
</script>

<form onsubmit={handleDataClose}>
    <header 
        use:swipeable={{ direction: 'x', threshold: '30px' }} 
        onswipeend={toggle}
        style:right="{menuContext.offsetWidth}px">
    </header>

    <nav>
        {@render children?.()}
    </nav>
</form>

<style lang="scss">
    @use '../../../styles/vars.scss';

    :root {
        --scrollbar-width: 0px;

        @media (hover: hover) and (pointer: fine) {
            --scrollbar-width: calc(100vw - 100%);
        }
    }

    header {
        position: fixed;
        display: flex;
        flex-direction: column;
        justify-content: center;
        right: var(--scrollbar-width);
        width: 1em;
        height: 100%;
        z-index: 100;
        text-align: right;
        margin-top: 2.2em;
    }
</style>
