<script lang='ts'>
    import '../../styles/menu.scss';
    import { t } from 'svelte-i18n';
    import { derived } from 'svelte/store';
    import { link, location } from 'svelte-spa-router'
    import NavButton from '../ui/elements/NavButton.svelte';
    import LoginMenu from './LoginMenu.svelte';
    import SignupMenu from './SignupMenu.svelte';
    import ProfileMenu from './ProfileMenu.svelte';
    import ShareMenu from './ShareMenu.svelte';
    import ColumnMenu from './ColumnMenu.svelte';
    import EventListMenu from './EventListMenu.svelte';
    import ExportMenu from './ExportMenu.svelte';
    import AdvanceTable from '../table/AdvanceTable.svelte';
    import MenuDrawer from '../ui/elements/MenuDrawer.svelte';
    import Sidebar from '../ui/Sidebar.svelte'
    import { currentUser } from '../../service/auth.service';
    import { currentMenu } from '../../store/app.store';
    import TagCloud from './TagCloud.svelte';

    export let title: string;
    export let footer: string;
    const isTableView = derived(location, (path) => path.startsWith('/songs') || path.startsWith('/samples'));
    const isBlogView = derived(location, (path) => path.startsWith('/blog'));
    const isEventView = derived(location, (path) => path.startsWith('/events'));
    let counter = 0;
</script>

<MenuDrawer>
    {#if $currentMenu === 'dynamic'}
    <Sidebar {title}>
        {#if $currentUser}
            <ProfileMenu email={$currentUser.email}
                photoURL={$currentUser.photoURL} 
                displayName={$currentUser.displayName}  
            />
        {:else}
            <LoginMenu />
        {/if}

        {#if $isTableView}
            <ExportMenu exportTitle="{ $t('menu.table.exportTitle') }" />
            <ColumnMenu />
        {:else if $isBlogView}
            <TagCloud />
        {:else if $isEventView}
            <EventListMenu />
        {:else if $currentUser}
            <ShareMenu />
        {/if}
        
        <svelte:fragment slot="lower">
            {#if counter >= 5e5 || import.meta.env.DEV}
            <AdvanceTable>{ $t('menu.masterdata') }</AdvanceTable>
            {/if}
            <NavButton href="/songs" title="{ $t('menu.songs') }">
                <span><i class='bx bxs-playlist'></i> { $t('menu.songs') }</span>
            </NavButton>
            <NavButton href="/events" title="{ $t('menu.event-calendar') }">
                <span><i class='bx bx-calendar'></i> { $t('menu.events') }</span>
            </NavButton>
            <NavButton href="/blog" title="{ $t('menu.howto-blog') }">
                <span><i class='bx bx-bulb'></i> { $t('menu.howto') }</span>
            </NavButton>
            <div class="row">
                <a use:link class="warn" role="button" href="/user/ocsoft42">
                    <span><i class='bx bxs-coffee'></i> { $t('menu.donate') }</span>
                </a>
            </div>
        </svelte:fragment>
        <svelte:fragment slot="footer">
            <div aria-hidden="true" on:click={() => counter++} on:contextmenu={() => counter = counter > 5 ? 5e5 : 0}></div>
            {footer}
        </svelte:fragment>
    </Sidebar>
    {:else if $currentMenu === 'signup'}
    <Sidebar title="{ $t('menu.login.signup') }">
        <SignupMenu />
        <svelte:fragment slot="footer">
            {footer}
        </svelte:fragment>
    </Sidebar>
    {/if}
</MenuDrawer>
