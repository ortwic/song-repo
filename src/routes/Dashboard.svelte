<script>
    import { t } from 'svelte-i18n';
    import { fly } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';
    import { link } from '@keenmate/svelte-spa-router';
    import { swipeable } from '@svelte-put/swipeable';
    import RecentSongs from '../components/dashboard/RecentSongs.svelte';
    import Footer from '../components/ui/Footer.svelte';
    import GetStarted from '../components/dashboard/GetStarted.svelte';
    import SearchSongs from '../components/dashboard/SearchSongs.svelte';
    import SongStats from '../components/dashboard/SongStats.svelte';
    import Landing from '../components/dashboard/Landing.svelte';
    import TitlebarMenu from '../components/menus/TitlebarMenu.svelte';
    import { getPage } from '../service/common/page.service';
    import { authService, currentUser } from '../service/user/auth.service';
    import { content, menuContext } from '../store/menu-context.svelte';
    import { currentProfile } from '../store/profile.store';

    const INFO_KEY = 'song-repo_hide-dashboard-info';
    let hideInfo = $state(sessionStorage.getItem(INFO_KEY) === 'true');

    function setHideInfo() {
        hideInfo = true;
        sessionStorage.setItem(INFO_KEY, 'true');
    }

    async function signOut() {
        await authService.signOut();
        menuContext.showMenu();
    }

    const dashboard = getPage('dashboard');
</script>

<svelte:head>
    <title>Dashboard | {import.meta.env.PACKAGE_NAME}</title>
</svelte:head>

<main use:content={{ overflow: 'auto' }}>
    <TitlebarMenu>
        {#if $currentUser}
            <i class="bx bx-user-circle"></i>&nbsp; { $t('start.hello')} { $currentProfile.name ?? $currentProfile.alias }
        {:else}
            <i class="bx bx-world"></i>&nbsp; { $t('start.hello')} { $t('start.anonymous') }
        {/if}
    </TitlebarMenu>
    <section>
        {#if $currentUser}
        {#if dashboard && !hideInfo}
            <div class="info-box" title={$t('start.dont-show-again')}
                transition:fly={{ duration: 200, x: '100%', easing: cubicOut }}
                use:swipeable={{ direction: 'right', threshold: '1rem' }}
                onswipeend={setHideInfo}>
                {@html dashboard.body}
            </div>
        {/if}
        <p>
            <GetStarted />
        </p>
        <p>
            <SearchSongs />
        </p>
        <p>
            <SongStats />
            <RecentSongs />
        </p>
        <div style="text-align: right;">
            <button class="clear" title={$t('profile.sign-out')} onclick={signOut}>
                <i class="bx bx-log-out-circle"></i> {$t('profile.sign-out')}
            </button>
        </div>
        {:else}
        <Landing />
        {/if}
    </section>
    <Footer>
        <a use:link href="/docs/imprint" class="no-wrap">{ $t('start.imprint') }</a> |
        <a use:link href="/docs/privacypolicy" class="no-wrap">{ $t('start.privacypolicy') }</a> |
        <a use:link href="/docs/termsofuse" class="no-wrap">{ $t('start.termsofuse') }</a>
    </Footer>
</main>

<style lang="scss">
section {
    padding: 1em 5%;
    max-width: 40em;
}
</style>