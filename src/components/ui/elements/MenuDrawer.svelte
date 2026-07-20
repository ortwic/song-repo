<script lang="ts">
    import { swipeable } from '@svelte-put/swipeable';
    import { menuContext } from '../../../store/menu-context.svelte';

    interface Props {
        onOpen: () => void;
        children?: import('svelte').Snippet;
    }

    let { children, onOpen }: Props = $props();
</script>

<header 
    use:swipeable={{ direction: 'x', threshold: '30px' }} 
    onswipeend={onOpen}
    style:right="{menuContext.offsetWidth}px">
</header>

<nav>
    {@render children?.()}
</nav>

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
