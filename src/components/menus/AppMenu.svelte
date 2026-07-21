<script lang="ts">
    import '../../styles/menu.scss';
    import { t } from 'svelte-i18n';
    import { link } from '@keenmate/svelte-spa-router';
    import LoginMenu from './LoginMenu.svelte';
    import ProfileMenu from './ProfileMenu.svelte';
    import Sidebar from '../ui/Sidebar.svelte';
    import MenuDrawer from '../ui/elements/MenuDrawer.svelte';
    import { currentUser } from '../../service/user/auth.service';
    import { menu } from '../../store/menu-context.svelte';

    const version = `${import.meta.env.PACKAGE_NAME} ${import.meta.env.PACKAGE_VERSION}`;
</script>

<MenuDrawer offset={menu.offsetWidth} onOpen={() => menu.show()}>
    {#if menu.visible && menu.submenus}
    <Sidebar offset={menu.offsetWidth} onClose={() => menu.back()}>
        {#each menu.submenus as Submenu}
            <Submenu />
        {/each}

        {#snippet footer()}
            {version}
        {/snippet}
    </Sidebar>
    {:else if menu.visible}
    <Sidebar offset={menu.offsetWidth} onClose={() => menu.back()}>
        {#if $currentUser}
            <ProfileMenu />

            {#each menu.userContext as Section}
                <Section />
            {/each}
        {:else if !$currentUser && !menu.shouldHideLogin}
            <LoginMenu />
        {/if}

        {#each menu.context as Section}
            <Section />
        {/each}

        {#snippet lower()}
            <div class="row">
                <a use:link class="warn" role="button" href="/@song-repo">
                    <span>
                        <i class="bx bxs-coffee"></i> {$t('menu.donate')}
                    </span>
                </a>
            </div>
        {/snippet}

        {#snippet footer()}
            {version}
        {/snippet}
    </Sidebar>
    {/if}
</MenuDrawer>

<style>
    a[role="button"] > span > i.bx.bxs-coffee {
        color: black;
        background-color: white;
    }
</style>