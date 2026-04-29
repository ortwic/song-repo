<script lang="ts">
    import type { MenuTarget } from "../../../model/types";

    interface Props {
        target?: MenuTarget;
        children?: import('svelte').Snippet;
        onClose?: () => void;
    }

    let { target = 'hidden', children, onClose }: Props = $props();
</script>

<div class="titlebar">
    <span>
        {@render children?.()}
    </span>
    <button data-target={target} class="close" onclick={onClose}>✕</button>
</div>

<style lang="scss">
    div.titlebar {
        display: flex;
        justify-content: space-between;
        max-height: 2.2em;
        padding: 0;

        span {
            display: inline-block;
            flex-grow: 1;
            font-style: italic;
            padding: .4em .8em;
        }

        button.close {
            color: inherit;
            background-color: transparent;
            box-shadow: unset;
            padding: 0 1.3em;
            border: 0;
            outline: 0;
            max-width: 4em;
            max-height: inherit;
            transition: all .2s ease-in-out;
            font-size: smaller;

            &:hover {
                background-color: #F0F0F040;
            }
        }
    }
</style>