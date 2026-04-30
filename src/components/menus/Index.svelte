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
    import BackupMenu from './BackupMenu.svelte';
    import ColumnMenu from './ColumnMenu.svelte';
    import EventListMenu from './EventListMenu.svelte';
    import MenuDrawer from '../ui/elements/MenuDrawer.svelte';
    import Sidebar from '../ui/Sidebar.svelte'
    import { currentUser } from '../../service/auth.service';
    import { currentMenu } from '../../store/app.store';
    import TagCloud from './TagCloud.svelte';

    interface Props {
        footer: string;
    }

    let { footer }: Props = $props();
    const isTableView = derived(location, (path) => path.startsWith('/songs'));
    const isBlogView = derived(location, (path) => path.startsWith('/blog'));
    const isEventView = derived(location, (path) => path.startsWith('/events'));

    function hide() {
        currentMenu.set('hidden');
    }
</script>

<MenuDrawer>
    {#if $currentMenu === 'dynamic'}
    <Sidebar title="{ $t('menu.start') }" onclose={hide}>
        {#if $currentUser}
            <ProfileMenu email={$currentUser.email}
                photoURL={$currentUser.photoURL} 
                displayName={$currentUser.displayName}  
            />
        {:else}
            <LoginMenu />
        {/if}

        {#if $isTableView}
            <BackupMenu exportTitle="{ $t('menu.table.exportTitle') }" />
            <ColumnMenu />
        {:else if $isBlogView}
            <TagCloud />
        {:else if $isEventView}
            <EventListMenu />
        {:else if $currentUser}
            <ShareMenu />
        {/if}
        
        {#snippet lower()}
            <NavButton href="/songs" title="{ $t('menu.repo') }">
                <span><i class='bx bxs-playlist'></i> { $t('menu.repo') }</span>
            </NavButton>
            <NavButton href="/events" title="{ $t('menu.event-calendar') }">
                <span><i class='bx bx-calendar'></i> { $t('menu.events') }</span>
            </NavButton>
            <NavButton href="/blog" title="{ $t('menu.howto-blog') }">
                <span><i class='bx bx-music'></i> { $t('menu.howto') }</span>
            </NavButton>
            <div class="row">
                <a use:link class="warn" role="button" href="/user/ocsoft42">
                    <span><i class='bx bxs-coffee'></i> { $t('menu.donate') }</span>
                </a>
            </div>
        {/snippet}
        {#snippet footer()}
            {footer}
        {/snippet}
    </Sidebar>
    {:else if $currentMenu === 'signup'}
    <Sidebar title="{ $t('menu.login.signup') }" onclose={hide}>
        <SignupMenu />
        {#snippet footer()}
            {footer}
        {/snippet}
    </Sidebar>
    {/if}
</MenuDrawer>
