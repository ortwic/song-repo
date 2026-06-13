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
    import MenuDrawer from '../ui/elements/MenuDrawer.svelte';
    import NavButton from '../ui/elements/NavButton.svelte';
    import { currentUser } from '../../service/user/auth.service';
    import { currentMenu } from '../../store/app.store';

    interface Props {
        footer: string;
    }

    let { footer }: Props = $props();
    const isDashboard = derived(location, (path) => path === '/');
    const isTableView = derived(location, (path) => path.startsWith('/songs'));
    const isBlogView = derived(location, (path) => path.startsWith('/blog'));
    const isEventView = derived(location, (path) => path.startsWith('/events'));

    function hide() {
        currentMenu.set('hidden');
    }
</script>

<MenuDrawer>
    {#if $currentMenu === 'dynamic'}
        <Sidebar title={$t('menu.start')} onclose={hide}>
            {#if $currentUser}
                <ProfileMenu
                    email={$currentUser.email}
                    photoURL={$currentUser.photoURL}
                    displayName={$currentUser.displayName}
                />
            {:else if !$isEventView && !$isBlogView}
                <LoginMenu />
            {/if}

            {#if $isTableView}
                <TableMenu exportTitle={$t('menu.table.exportTitle')} />
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
                <NavButton href="/songs" title={$t('menu.repo')}>
                    <span><i class="bx bxs-playlist"></i> {$t('menu.repo')}</span>
                </NavButton>
                <NavButton href="/events" title={$t('menu.event-calendar')}>
                    <span><i class="bx bx-calendar"></i> {$t('menu.events')}</span>
                </NavButton>
                <NavButton href="/blog" title={$t('menu.howto-blog')}>
                    <span><i class="bx bx-music"></i> {$t('menu.howto')}</span>
                </NavButton>
                <div class="row">
                    <a use:link class="warn" role="button" href="/user/ocsoft42">
                        <span>
                            <i class="bx bxs-coffee"></i> {$t('menu.donate')}
                        </span>
                    </a>
                </div>
            {/snippet}
            {#snippet footer()}
                {footer}
            {/snippet}
        </Sidebar>
    {:else if $currentMenu === 'signup'}
        <Sidebar title={$t('menu.login.signup')} onclose={hide}>
            <SignupMenu />
            {#snippet footer()}
                {footer}
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