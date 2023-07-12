<script lang="ts">
  import Login from './components/login/Login.svelte';
  import Signup from './components/login/Signup.svelte';
  import SongTable from './components/table/SongTable.svelte';
  import MenuButton from './components/ui/MenuButton.svelte';
  import Sidebar from './components/ui/Sidebar.svelte'
  import Snackbar from './components/ui/Snackbar.svelte';
  import type { MenuPages } from './model/types';
  import { currentMenu } from './store/app.store';

  const title = `${import.meta.env.DEV ? 'DEV' : 'My'} song repertory`;
  const version = '0.1.1';
  const footer = `Version ${version} alpha`;

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
  <title>{title}</title>
  <link href="https://unpkg.com/boxicons@2.0.7/css/boxicons.min.css" rel="stylesheet" />
</svelte:head>


<form on:submit|preventDefault={submit}>
  <header>
    <MenuButton target='login' />
  </header>
  <nav>
    {#if $currentMenu == 'login'}
    <Sidebar {title} {footer}>
      <Login />
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
