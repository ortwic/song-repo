<script>
    import { t } from 'svelte-i18n';
    import { link } from 'svelte-spa-router';
    import RecentSongs from '../components/dashboard/RecentSongs.svelte';
    import Footer from '../components/ui/Footer.svelte';
    import Welcome from '../components/dashboard/Welcome.svelte';
    import TitlebarMenu from '../components/menus/TitlebarMenu.svelte';
    import AuthService, { currentUser } from '../service/auth.service';
    import { currentProfile } from '../service/user.service';
    import { currentMenu } from '../store/app.store';

    const authService = new AuthService();

    async function signOut() {
        await authService.signOut();
        currentMenu.set('dynamic');
    }
</script>

<main class="content">
    <TitlebarMenu>
        {#if $currentUser}
            <i class="bx bx-user-circle"></i>&nbsp; { $t('start.hello')} { $currentProfile.name ?? $currentProfile.alias }
        {:else}
            <i class="bx bx-world"></i>&nbsp; { $t('start.hello')} { $t('start.anonymous') }
        {/if}
    </TitlebarMenu>
    <section>
        {#if $currentUser}
        <RecentSongs />
        <div style="text-align: right;">
            <button class="clear" title={$t('profile.sign-out')} data-close onclick={signOut}>
                <i class="bx bx-log-out-circle"></i> {$t('profile.sign-out')}
            </button>
        </div>
        {:else}
        <Welcome />
        {/if}
    </section>
    <Footer>
        <a use:link href="/docs/imprint" class="no-wrap">{ $t('start.imprint') }</a> |
        <a use:link href="/docs/privacypolicy" class="no-wrap">{ $t('start.privacypolicy') }</a> |
        <a use:link href="/docs/termsofuse" class="no-wrap">{ $t('start.termsofuse') }</a> |
        <a use:link href="/settings" class="no-wrap">{ $t('settings.title') }</a>
    </Footer>
</main>

<style lang="scss">
main {
    & > section {
        padding: 1em 5%;
        max-width: 40em;

    }

    .titlebar a {
        display: flex;
        align-items: center;
    }
}
</style>