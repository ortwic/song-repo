<script>
    import { t } from 'svelte-i18n';
    import { link } from 'svelte-spa-router';
    import { currentUser } from '../service/auth.service';
    import RecentSongs from '../components/dashboard/RecentSongs.svelte';
    import Footer from '../components/ui/Footer.svelte';
    import Welcome from '../components/dashboard/Welcome.svelte';
</script>

<main class="content">
    <div class="titlebar">
        <i class="bx bx-world"></i>&nbsp; { $t('start.hello')}
    </div>
    <section>
        {#if $currentUser}
        <RecentSongs />
        <p class="center">
            <a href="#/songs" class="no-wrap">
                <i class="bx bxs-playlist"></i>
                <span>{ $t('menu.songs') }</span>
            </a> 
            |
            <a href="#/blog" class="no-wrap">
                <i class="bx bx-bulb"></i>
                { $t('menu.howto') }
            </a> 
            |
            <a href="#/events" class="no-wrap">
                <i class="bx bx-calendar"></i>
                { $t('menu.events') }
            </a>
        </p>
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
}
</style>