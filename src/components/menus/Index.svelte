<script lang="ts">
    import '../../styles/menu.scss';
    import { t } from 'svelte-i18n';
    import { derived } from 'svelte/store';
    import { link, location } from 'svelte-spa-router';
    import LoginMenu from './LoginMenu.svelte';
    import SignupMenu from './SignupMenu.svelte';
    import ProfileMenu from './ProfileMenu.svelte';
    import ShareMenu from './ShareMenu.svelte';
    import TableMenu from './TableMenu.svelte';
    import ColumnMenu from './ColumnMenu.svelte';
    import RecentMenu from './RecentMenu.svelte';
    import BlogMenu from './BlogMenu.svelte';
    import EventListMenu from './EventListMenu.svelte';
    import Sidebar from '../ui/Sidebar.svelte';
    import { tableContext } from '../table/table.svelte';
    import MenuDrawer from '../ui/elements/MenuDrawer.svelte';
    import { currentUser } from '../../service/user/auth.service';
    import { currentMenu } from '../../store/app.store';

    const version = `${import.meta.env.PACKAGE_NAME} ${import.meta.env.PACKAGE_VERSION}`;
    const isDashboard = derived(location, (path) => path === '/');
    const isBlogView = derived(location, (path) => path.startsWith('/blog'));
    const isEventView = derived(location, (path) => path.startsWith('/events'));

    function hide() {
        currentMenu.set('hidden');
    }
</script>

<MenuDrawer>
    {#if $currentMenu === 'dynamic'}
        <Sidebar onclose={hide}>
            {#if $currentUser}
                <ProfileMenu
                    email={$currentUser.email}
                    photoURL={$currentUser.photoURL}
                    displayName={$currentUser.displayName}
                />
            {:else if !$isEventView && !$isBlogView}
                <LoginMenu />
            {/if}

            {#if tableContext.table}
                <TableMenu />
                <ColumnMenu />
            {:else if $isBlogView}
                <BlogMenu />
            {:else if $isEventView}
                <EventListMenu />
            {:else if $currentUser}
                {#if $isDashboard}
                    <RecentMenu />
                {/if}
                <ShareMenu />
            {/if}

            {#snippet lower()}
                <div class="row">
                    <a use:link class="warn" role="button" href="/user/song-repo">
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
    {:else if $currentMenu === 'signup'}
        <Sidebar onclose={hide}>
            <SignupMenu />
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