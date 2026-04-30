<script lang="ts">
    import { derived, get } from "svelte/store";
    import { swipeable } from '@svelte-put/swipeable';
    import type { MenuTarget } from "../../../model/types";
    import { currentMenu } from "../../../store/app.store";

    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();

    const opened = derived(currentMenu, (p) => p !== 'hidden');

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
    <header
        use:swipeable={{ direction: 'x', threshold: '30px' }} 
        onswipeend={toggle}>
        <!-- <div class="toggle clear {$opened ? 'opened' : ''}">
            <i class="bx bxs-chevrons-left"></i>
        </div> -->
    </header>

    <nav>
        {@render children?.()}
    </nav>
</form>

<style lang="scss">
@use "../../../styles/vars.scss";

header {
    position: fixed;
    display: flex;
    flex-direction: column;
    justify-content: center;
    right: 0;
    min-width: 3em;
    height: 100%;
    z-index: 100;
    text-align: right;
    margin-top: 2.2em;

    // .toggle {
    //     transform: scale(.4, 1);
    //     transition: margin-right 0.2s;
    //     color: var(--primary-opaque);
    //     padding-right: .2em;
    //     font-size: 3em;
        
    //     &.opened {
    //         margin-right: calc(vars.$sidebar-width + .2em);

    //         i {
    //             transform: rotate(180deg);
    //             text-shadow: -1px -1px 2px rgba(0, 0, 0, 70%);
    //         }
    //     }

    //     i {
    //         transition: all 0.2s;
    //     }
    // }
} 

nav [aria-hidden] {
    position: absolute;
    right: 0;
    width: 1.5em;
    height: 1.5em;
}

</style>