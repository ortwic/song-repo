<script lang="ts">
  import Router, { push } from "svelte-spa-router";
  import { map } from 'rxjs';
  import type { User } from 'firebase/auth';
  import Menu from './components/menus/Index.svelte';
  import SongTable from './components/table/SongTable.svelte';
  import Snackbar from './components/ui/Snackbar.svelte';
  import Start from "./routes/Start.svelte";
  import Calendar from "./routes/Calendar.svelte";
  import Blog from "./routes/Blog.svelte";
  import Feedback from "./routes/Feedback.svelte";
  import NotFound from "./routes/NotFound.svelte";
  import { currentUser } from './service/auth.service';
    
  const title = `${import.meta.env.DEV ? 'DEV' : 'My'} song repertory`;
  const usertitle = currentUser.pipe(map(setPageInfo));
  const version = '0.2.0';
  
  const routes = {
    '/': Start,
    '/songs': SongTable,
    '/songs/:id': SongTable,
    '/samples': SongTable,
    '/events': Calendar,
    '/blog': Blog,
    '/blog/:label': Blog,
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
</script>

<svelte:head>
  <meta name="author" content="OCSoft, ocsoft42@gmail.com">
  <title>{$usertitle}</title>
  <link href="https://unpkg.com/boxicons@2.0.7/css/boxicons.min.css" rel="stylesheet" />
</svelte:head>

<Menu {title} footer="Version {version} beta" />

<Router {routes}/>

<Snackbar />
