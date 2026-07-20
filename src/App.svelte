<script lang="ts">
    import { t } from 'svelte-i18n';
    import { Router } from '@keenmate/svelte-spa-router';
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
    import NotFound from './routes/NotFound.svelte';
    import { currentUser } from './service/user/auth.service';
    import { setAppReady } from './store/app.store';
    import { showInfo } from './store/notification.store';

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
        '/songs/:uid': SongTable,

        // hidden / unused routes
        '/calendar': EventCalendar,
        '/feedback': Feedback,
        '*': NotFound,
    };

    $effect(() => {
        if (window.innerWidth <= 600) {
            const metaTag = document.createElement('meta');
            metaTag.name = 'viewport';
            metaTag.content = 'width=device-width, initial-scale=0.9, maximum-scale=1';
            document.head.appendChild(metaTag);
        }

        const sub = currentUser.subscribe((user) => 
            sayHello(user?.displayName || user?.email.split('@')[0]?.replace('.', ' '))
        );

        setAppReady();

        return () => sub?.unsubscribe();
    });

    function sayHello(name: string) {
        if (name) {
            showInfo(`${$t('start.hello')} ${name}!`);
        }
    }
</script>

<svelte:head>
    <meta name="author" content="OCSoft, ocsoft42@gmail.com" />
    <title>Loading...</title>
</svelte:head>

<Context>
    <Menu />

    <Router {routes} restoreScrollState={true} />

    <Snackbar />
</Context>
