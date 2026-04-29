<script lang="ts">
    import { preventDefault } from 'svelte/legacy';

    import { derived, get } from "svelte/store";
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
        const target = ev.submitter.getAttribute('data-target') as MenuTarget;
        if (target) {
            currentMenu.set(target);
        } else if (ev.submitter.getAttribute('data-close') !== null) {
            currentMenu.set('hidden');
        }
    }
</script>

<form onsubmit={preventDefault(navigate)}>
    <header>
        <button class="toggle clear icon {$opened ? 'opened' : ''}" 
            title="{$opened ? 'Close menu' : 'Open menu'}"
            onclick={() => toggle()}>
            <i class="bx bxs-chevrons-left"></i>    
        </button>
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
//   background-color: #cccc;
    z-index: 100;
    height: 100%;
    text-align: right;

    .toggle {
        transform: scale(.4, 1);
        transition: margin-right 0.2s;
        color: var(--primary-opaque);
        
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
} 

nav [aria-hidden] {
    position: absolute;
    right: 0;
    width: 1.5em;
    height: 1.5em;
}

</style>