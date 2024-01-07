<script lang='ts'>
    import '../../styles/menu.scss';
    import NavButton from '../ui/elements/NavButton.svelte';
    import Login from './Login.svelte';
    import Signup from './Signup.svelte';
    import Profil from './Profil.svelte';
    import Columns from './Columns.svelte';
    import ExportTable from './ExportTable.svelte';
    import AdvanceTable from '../table/AdvanceTable.svelte';
    import MenuButton from '../ui/elements/MenuButton.svelte';
    import Sidebar from '../ui/Sidebar.svelte'
    import type { MenuPages } from '../../model/types';
    import { t } from '../../service/i18n';
    import { currentUser } from '../../service/auth.service';
    import { currentMenu } from '../../store/app.store';

    export let title: string;
    export let footer: string;
    let isTableView = location.href.includes('/songs') || location.href.includes('/samples');
    let counter = 0;

    function handleMenuNav(ev: SubmitEvent) {
        const target = ev.submitter.getAttribute('data-target') as MenuPages;
        if (target) {
            currentMenu.set(target);
        } else if (ev.submitter.getAttribute('data-close') !== null) {
            currentMenu.set('root');
        }
    }
</script>

<form on:submit|preventDefault={handleMenuNav}>
    <header>
      <MenuButton target='login' />
    </header>
    <nav>
      {#if $currentMenu == 'login'}
      <Sidebar>
        <svelte:fragment slot="title">
          <a href="#/">{title}</a>
        </svelte:fragment>
        {#if $currentUser}
        <Profil email={$currentUser.email}
            photoURL={$currentUser.photoURL} 
            displayName={$currentUser.displayName} 
        />
        {:else}
        <Login />
        {/if}
        {#if isTableView}
        <ExportTable exportTitle="{ $t('menu.table.exportTitle') }" />
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
                <a class="coffee" role="button" target="_blank" href="https://liberapay.com/OCSoft42/donate">
                    <span><i class='bx bxs-coffee'></i> { $t('menu.donate') }</span>
                </a>
            </div>
        </svelte:fragment>
        <svelte:fragment slot="footer">
            <div aria-hidden="true" on:click={() => counter++} on:contextmenu={() => counter = counter > 5 ? 5e5 : 0}></div>
            {footer}
        </svelte:fragment>
      </Sidebar>
      {:else if $currentMenu == 'signup'}
      <Sidebar title="{ $t('menu.login.signup-title') }" back="login">
        <Signup />
        <svelte:fragment slot="footer">
            {footer}
        </svelte:fragment>
      </Sidebar>
      {:else if $currentMenu == 'columns'}
      <Sidebar title="{ $t('menu.table.set-view') }" back="login">
        <Columns />
        <svelte:fragment slot="footer">
            {footer}
        </svelte:fragment>
      </Sidebar>
      {/if}
    </nav>
  </form>
  

<style lang="scss">
    header {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 10;
      height: 0;
      text-align: right;
    } 

    nav {
        div.row > a.coffee {
            background-color: var(--secondary);

            &:hover {
                background-color: white;
            }

            & > span {
                color: black;
            }
        }

        [aria-hidden] {
            position: absolute;
            right: 0;
            width: 1.5em;
            height: 1.5em;
        }
    }

    a {
        color: inherit;

        &:hover {
            text-decoration: underline;
        }
    }
</style>