<script lang="ts">
    import '../../styles/menu.scss';
    import { t } from 'svelte-i18n';
    import { link, location } from '@keenmate/svelte-spa-router';
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
    import MenuDrawer from '../ui/elements/MenuDrawer.svelte';
    import { currentUser } from '../../service/user/auth.service';
    import { currentMenu } from '../../store/app.store';
    import { tableContext } from '../table/table.svelte';

    const version = `${import.meta.env.PACKAGE_NAME} ${import.meta.env.PACKAGE_VERSION}`;
    const isDashboard = $derived(location() === '/');
    const isBlogView = $derived(location().startsWith('/blog'));
    const isEventView = $derived(location().startsWith('/events'));
</script>

<MenuDrawer>
    {#if $currentMenu === 'dynamic'}
        <Sidebar onclose={() => currentMenu.set('hidden')}>
            {#if $currentUser}
                <ProfileMenu
                    email={$currentUser.email}
                    photoURL={$currentUser.photoURL}
                    displayName={$currentUser.displayName}
                />
            {:else if !isEventView && !isBlogView}
                <LoginMenu />
            {/if}

            {#if tableContext.table}
                <TableMenu />
                <ColumnMenu />
            {:else if isBlogView}
                <BlogMenu />
            {:else if isEventView}
                <EventListMenu />
            {:else if $currentUser}
                {#if isDashboard}
                    <RecentMenu />
                {/if}
                <ShareMenu />
            {/if}

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
    {:else if $currentMenu === 'signup'}
        <Sidebar onclose={() => currentMenu.set('dynamic')}>
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