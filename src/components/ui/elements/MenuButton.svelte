<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { derived } from "svelte/store";
    import type { MenuPages } from "../../../model/types";
    import { currentMenu } from "../../../store/app.store";

    const dispatch = createEventDispatcher();
    const opened = derived(currentMenu, (p) => p !== 'root');

    export let target: MenuPages;

    function open() {
        if ($currentMenu === 'root') {
            currentMenu.set(target);
            dispatch('opened');
        } else {
            currentMenu.set('root');
            dispatch('closed');
        }
    }
</script>

<button class="clear icon {$opened ? 'opened' : ''}" on:click={open}>
    <i class="bx bxs-chevrons-left"></i>    
</button>

<style lang="scss">
@use "../../../styles/vars.scss";

button {
    transform: scale(.4, 1);
    transition: margin-right 0.2s;

    &.opened {
        margin-right: vars.$sidebar-width;

        i {
            transform: rotate(180deg);
            text-shadow: -1px -1px 2px rgba(0, 0, 0, 70%);
        }
    }

    i {
        transition: all 0.2s;
    }
}

</style>