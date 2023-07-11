<script lang="ts">
  import Login from './components/login/Login.svelte';
  import Signup from './components/login/Signup.svelte';
  import SongTable from './components/table/SongTable.svelte';
  import ToggleButton from './components/ui/ToggleButton.svelte';
  import Sidebar from './components/ui/Sidebar.svelte'
  import Snackbar from './components/ui/Snackbar.svelte';
  import { currentMenu } from './store/app.store';

  const title = `${import.meta.env.DEV ? 'DEV' : 'My'} song repertory`;
  const footer = 'Version 0.1.1 pre-alpha';

  function submit(ev: SubmitEvent) {
    if (ev.submitter.id == 'toggle') {
      currentMenu.set($currentMenu == 'none' ? 'login' : 'none');
    } else if (ev.submitter.id == 'signup') {
      currentMenu.set('signup');
    } else {
      currentMenu.set('none');
    }
  }
</script>

<svelte:head>
  <title>{title}</title>
  <link href="https://unpkg.com/boxicons@2.0.7/css/boxicons.min.css" rel="stylesheet" />
</svelte:head>


<form on:submit|preventDefault={submit}>
  <header>
    <ToggleButton />
  </header>
  <nav>
    {#if $currentMenu == 'login'}
    <Sidebar {title} {footer}>
      <Login />
    </Sidebar>
    {:else if $currentMenu == 'signup'}
    <Sidebar title="Sign up" {footer}>
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
