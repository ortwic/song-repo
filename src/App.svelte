<script lang="ts">
  import { onMount } from "svelte";
  import { t } from "svelte-i18n";
  import Router, { location, push } from "svelte-spa-router";
  import { map } from 'rxjs';
  import type { User } from 'firebase/auth';
  import Menu from './components/menus/Index.svelte';
  import SongTable from './components/table/SongTable.svelte';
  import Snackbar from './components/ui/Snackbar.svelte';
  import Start from "./routes/Start.svelte";
  import Calendar from "./routes/Calendar.svelte";
  import Blog from "./routes/Blog.svelte";
  import Signup from "./routes/Signup.svelte";
  import Settings from "./routes/Settings.svelte";
  import Document from "./routes/Document.svelte";
  import Feedback from "./routes/Feedback.svelte";
  import NotFound from "./routes/NotFound.svelte";
  import { currentUser } from './service/auth.service';
  import { setupI18n } from "./service/i18n";
    
  const title = `${import.meta.env.DEV ? 'DEV' : 'Start'}`;
  const usertitle = currentUser.pipe(map(redirectToSongs));
  const version = import.meta.env.PACKAGE_VERSION;
  
  const routes = {
    '/': Start,
    '/songs': SongTable,
    '/songs/:id': SongTable,
    '/samples': SongTable,
    '/events': Calendar,
    '/blog': Blog,
    '/blog/:label': Blog,
    '/docs/:name': Document,
    '/signup': Signup,
    '/settings': Settings,
    '/feedback': Feedback,
    '*': NotFound
  };
  
  onMount(() => {
    if(window.innerWidth <= 600) {
      const metaTag = document.createElement('meta');
      metaTag.name = "viewport";
      metaTag.content = "width=device-width, initial-scale=0.9, maximum-scale=1";
      document.head.appendChild(metaTag);
    }
  });

  function redirectToSongs(user: User): string {
    if (user && $location === '/') {
      push(`/songs`);
      const name = user.displayName || user.email.split('@')[0]?.replace('.', ' ');
      return `${name}'s known songs`;
    }
    return `${title} | Login`;
  }
</script>

<svelte:head>
  <meta name="author" content="OCSoft, ocsoft42@gmail.com">
  <title>{$usertitle || 'Loading...'}</title>
  <link href="https://unpkg.com/boxicons@2.0.7/css/boxicons.min.css" rel="stylesheet" />
</svelte:head>

{#await setupI18n()}
  { $t('start.loading') }
{:then} 
  <Menu {title} footer="Version {version}" />

  <Router {routes}/>

  <Snackbar />
{:catch error}
  <p>
    Error while loading translations: <br />
    { error }
  </p>
{/await}
