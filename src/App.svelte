<script lang="ts">
  import { map } from 'rxjs';
  import Login from './components/menus/Login.svelte';
  import Signup from './components/menus/Signup.svelte';
  import Profil from './components/menus/Profil.svelte';
  import Info from './components/menus/Info.svelte';
  import SongTable from './components/table/SongTable.svelte';
  import ExportTable from './components/table/ExportTable.svelte';
  import MenuButton from './components/ui/MenuButton.svelte';
  import Sidebar from './components/ui/Sidebar.svelte'
  import Snackbar from './components/ui/Snackbar.svelte';
  import type { MenuPages } from './model/types';
  import { currentUser } from './service/auth.service';
  import { currentMenu } from './store/app.store';

  const title = `${import.meta.env.DEV ? 'DEV' : 'My'} song repertory`;
  const usertitle = currentUser.pipe(map(getUserTitle))
  const version = '0.1.2';
  const footer = `Version ${version} alpha`;

  function getUserTitle(user: { displayName: string; email: string; }): string {
    if (user) {
      const name = user.displayName || user.email.split('@')[0]?.replace('.', ' ');
      return `${name}'s known songs`;
    }
    return `${title} | Login`;
  }

  function submit(ev: SubmitEvent) {
    const target = ev.submitter.getAttribute('data-target') as MenuPages;
    if (target) {
      currentMenu.set(target);
    } else if (ev.submitter.getAttribute('data-close') !== null) {
      currentMenu.set('root');
    }
  }
</script>

<svelte:head>
  <meta name="author" content="OCSoft, ocsoft42@gmail.com">
  <title>{$usertitle}</title>
  <link href="https://unpkg.com/boxicons@2.0.7/css/boxicons.min.css" rel="stylesheet" />
</svelte:head>


<form on:submit|preventDefault={submit}>
  <header>
    <MenuButton target='login' />
  </header>
  <nav>
    {#if $currentMenu == 'login'}
    <Sidebar {title} {footer}>
      {#if $currentUser}
      <Profil email={$currentUser.email}
          photoURL={$currentUser.photoURL} 
          displayName={$currentUser.displayName} 
      />
      {:else}
      <Login />
      {/if}
      <svelte:fragment slot="footer">
        <ExportTable />
        <Info />
      </svelte:fragment>
    </Sidebar>
    {:else if $currentMenu == 'signup'}
    <Sidebar title="Sign up to use app" {footer}>
      <Signup />
    </Sidebar>
    {/if}
  </nav>
</form>

<main> 
  <SongTable />
</main>

<Snackbar />

<style>
  header {
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 10;
    height: 0;
    text-align: right;
  }

  main {
    height: 100vh;
    overflow: hidden;
  }
 
</style>
