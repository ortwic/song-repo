<script lang="ts">
    import { get } from 'svelte/store';
    import { swipeable } from '@svelte-put/swipeable';
    import type { MenuTarget } from '../../../model/types';
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

    function navigate(ev: SubmitEvent) {
        ev.preventDefault();

        const target = ev.submitter.getAttribute('data-target') as MenuTarget;
        if (target) {
            currentMenu.set(target);
        } else if (ev.submitter.getAttribute('data-close') !== null) {
            currentMenu.set('hidden');
        }
    }
</script>

<form onsubmit={navigate}>
    <header use:swipeable={{ direction: 'x', threshold: '30px' }} onswipeend={toggle}></header>

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

    nav [aria-hidden] {
        position: absolute;
        right: 0;
        width: 1.5em;
        height: 1.5em;
    }
</style>
