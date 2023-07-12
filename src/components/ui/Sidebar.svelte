<script lang='ts'>
    import '../../styles/menu.scss';
    import { slide } from 'svelte/transition';
    import Titlebar from './Titlebar.svelte';
	import { currentUser } from '../../service/auth.service';
    import { usersongs } from "../../store/song.store";
    import type { UserSong } from "../../model/song.model";

    export let title = '';
    export let footer = '';
    
    async function loadSamples(): Promise<void> {
        const { default: samples } = await import('../../data/samples.json');
        usersongs.set(samples as unknown as UserSong[]);
    }
</script>

<aside in:slide={{ duration: 200, axis: 'x' }} out:slide={{ duration: 200, axis: 'x' }} >
    <Titlebar target="root">{title}</Titlebar>
    <section>
        <slot></slot>
    </section>
    <footer class="menu">
        <slot name="footer"></slot>
        {#if !$currentUser}
        <div>
            <button data-close title="Load demo sample data" on:click={loadSamples}>
                <i class='bx bx-test-tube'></i> Load samples
            </button>
        </div>
        {/if}
        <div>
            <a role="button" target="_blank" href="http://buymeacoffee.com/ortwic">
                <span><i class='bx bxs-coffee'></i> Buy me a coffee</span>
            </a>
        </div>
        <div>
            <a role="button" target="_blank" href="https://github.com/users/ortwic/projects/2/views/1">
                <span><i class="bx bxl-github"></i> Feature overview</span>
            </a>
        </div>
        <div class="info">
            {footer}
        </div>
    </footer>
</aside>

<style lang="scss">
aside {
    display: flex;
    flex-direction: column;
    position: absolute;
    right: 0;
    height: 100%;
    z-index: 100;
    background-color: var(--primback);
    box-shadow: 0 0 2em #00000080;

    section {
        text-align: center;
        flex-grow: 1;
        overflow-y: auto;
    }

    div.info {
        color: whitesmoke;
        background-color: silver;
        padding-top: .4em;
        font-size: small;
        text-align: center;
        text-shadow: 1px 1px 0 gray;
        min-height: 2.2em;
    }
}
</style>
  