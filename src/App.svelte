<script lang="ts">
  import Router, { push } from "svelte-spa-router";
  import { map } from 'rxjs';
  import type { User } from 'firebase/auth';
  import Login from './components/menus/Login.svelte';
  import Signup from './components/menus/Signup.svelte';
  import Profil from './components/menus/Profil.svelte';
  import General from './components/menus/Index.svelte';
  import SongTable from './components/table/SongTable.svelte';
  import MenuButton from './components/ui/elements/MenuButton.svelte';
  import Sidebar from './components/ui/Sidebar.svelte'
  import Snackbar from './components/ui/Snackbar.svelte';
  import Start from "./routes/Start.svelte";
  import Blog from "./routes/Blog.svelte";
  import BlogPost from "./routes/BlogPost.svelte";
  import Feedback from "./routes/Feedback.svelte";
  import NotFound from "./routes/NotFound.svelte";
  import type { MenuPages } from './model/types';
  import { currentUser } from './service/auth.service';
  import { currentMenu } from './store/app.store';
    
  const title = `${import.meta.env.DEV ? 'DEV' : 'My'} song repertory`;
  const usertitle = currentUser.pipe(map(setPageInfo));
  const version = '0.2.0';
  const footer = `Version ${version} beta`;
  
  const routes = {
    '/': Start,
    '/songs': SongTable,
    '/songs/:id': SongTable,
    '/samples': SongTable,
    '/blog': Blog,
    '/blog/:label': Blog,
    '/post/:id': BlogPost,
    '/feedback': Feedback,
    '*': NotFound
  };

  function setPageInfo(user: User): string {
    if (user) {
      push(`/songs`);
      const name = user.displayName || user.email.split('@')[0]?.replace('.', ' ');
      return `${name}'s known songs`;
    }
    return `${title} | Login`;
  }

  function handleMenuNav(ev: SubmitEvent) {
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


<form on:submit|preventDefault={handleMenuNav}>
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
        <General />
      </svelte:fragment>
    </Sidebar>
    {:else if $currentMenu == 'signup'}
    <Sidebar title="Sign up to use app" {footer}>
      <Signup />
    </Sidebar>
    {/if}
  </nav>
</form>

<Router {routes}/>

<Snackbar />

<style>
  header {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 10;
    height: 0;
    text-align: right;
  } 
</style>
