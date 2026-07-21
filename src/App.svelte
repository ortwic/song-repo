<script lang="ts">
    import { t } from 'svelte-i18n';
    import { Router } from '@keenmate/svelte-spa-router';
    import AppMenu from './components/menus/AppMenu.svelte';
    import Context from './components/Context.svelte';
    import Snackbar from './components/ui/Snackbar.svelte';
    import { routes } from './routes.setup';
    import { currentUser } from './service/user/auth.service';
    import { setAppReady } from './store/media.store';
    import { showInfo } from './store/notification.store';

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
    <AppMenu />

    <Router {routes} restoreScrollState={true} />

    <Snackbar />
</Context>
