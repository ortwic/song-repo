<script lang="ts">
    import { onMount } from 'svelte';
    import Router, { location } from 'svelte-spa-router';
    import { map } from 'rxjs';
    import type { User } from 'firebase/auth';
    import Menu from './components/menus/Index.svelte';
    import Context from './components/Context.svelte';
    import Snackbar from './components/ui/Snackbar.svelte';
    import Blog from './routes/Blog.svelte';
    import Dashboard from './routes/Dashboard.svelte';
    import Document from './routes/Document.svelte';
    import EventCalendar from './routes/EventCalendar.svelte';
    import EventMap from './routes/EventMap.svelte';
    import Settings from './routes/Settings.svelte';
    import SnippetTable from './routes/SnippetTable.svelte';
    import SongTable from './routes/SongTable.svelte';
    import Feedback from './routes/Feedback.svelte';
    import UserPage from './routes/UserPage.svelte';
    import NotFound from './routes/NotFound.svelte';
    import { currentUser } from './service/user/auth.service';
    import { setupI18n } from './service/base/i18n.setup';

    const usertitle = currentUser.pipe(map(autoRedirect));
    const setAppReady = () => document.body.classList.add('app-ready');

    const routes = {
        '/': Dashboard,
        '/blog': Blog,
        '/blog/:slug': Blog,
        '/docs/:id': Document,
        '/events': EventMap,
        '/events/:id': EventMap,
        '/settings': Settings,
        '/snippets': SnippetTable,
        '/snippets/:id': SnippetTable,
        '/songs': SongTable,
        '/songs/:id': SongTable,
        '/user/:alias': UserPage,

        // hidden / unused routes
        '/calendar': EventCalendar,
        '/feedback': Feedback,
        '*': NotFound,
    };

    onMount(() => {
        if (window.innerWidth <= 600) {
            const metaTag = document.createElement('meta');
            metaTag.name = 'viewport';
            metaTag.content = 'width=device-width, initial-scale=0.9, maximum-scale=1';
            document.head.appendChild(metaTag);
        }
    });

    function autoRedirect(user: User): string {
        if ($location === '/') {
            const userParams = window.location.pathname.split('/@');
            if (userParams.length > 1) {
                window.location.href = `${window.location.origin}/#/user/${userParams.at(-1)}`;
            } else if (user) {
                const name = user.displayName || user.email.split('@')[0]?.replace('.', ' ');
                return `${name}'s known songs`;
            }
        }
        return `Start | Login`;
    }
</script>

<svelte:head>
    <meta name="author" content="OCSoft, ocsoft42@gmail.com" />
    <title>{$usertitle || 'Loading...'}</title>
</svelte:head>

{#await setupI18n().then(setAppReady)}
    &nbsp;
{:then} 
<Context>
    <Menu />

    <Router {routes} />

    <Snackbar />
</Context>
{:catch error}
  <p>
    Error while loading translations: <br />
    { error }
  </p>
{/await}
