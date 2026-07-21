<script lang="ts">
    import { t } from 'svelte-i18n';
    import { marked } from 'marked';
    import DonationHintDialog from './components/dialogs/DonationHintDialog.svelte';
    import Avatar from './components/ui/Avatar.svelte';
    import Footer from './components/ui/Footer.svelte';
    import type { UserProfileView } from './model/user.model';
    import UserService from './service/user/user.service';
    import { setAppReady } from './store/media.store';
    import NotFound from './routes/NotFound.svelte';

    interface Props {
        routeParams?: { alias?: string };
    }

    let { routeParams = {} }: Props = $props();

    let profile = $state<UserProfileView>();
    const userlinks$ = $derived(new UserService().getProfileWithLinks(routeParams.alias, 'default'));

    $effect(() => {
        const sub = userlinks$.subscribe((value) => {
            profile = value;
            setAppReady();
        });

        return () => !sub.closed && sub.unsubscribe();
    });
</script>

<DonationHintDialog />

<main class="content">
    {#if profile?.id}
        <h2>
            <Avatar photoURL={profile.photoURL} title={profile.name} />
            {profile.name}
        </h2>

        <p class="about">{@html marked(profile.about ?? '', { mangle: false, headerIds: false })}</p>
        
        <section class="linktree">
            <a class="link primary" role="button" href="/songs/{profile.id}">
                <i class="icon-badge bx bxs-playlist"></i>
                {$t('user.song-list')}
            </a>

            {#each profile.links as link}
                <a class="link" role="button" href={link.url} target="_blank">
                    <i class="icon-badge bx {link.icon}"></i>
                    {link.title}
                </a>
            {/each}
        </section>
    {:else}
        <NotFound>
            <p>{$t('user.alias-unknown', { 
                values: { 
                    alias: routeParams.alias 
                }
            })}</p>
        </NotFound>
    {/if}
    <p>
        <Footer />
    </p>
</main>

<style lang="scss">
    .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 2rem 1rem;

        & > * {
            max-width: 640px; 
        }
    }

    h2 {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5em;
        margin: 0;
        color: var(--accent);
        letter-spacing: 0.02em;
    }

    .about {
        padding: 0 1em;
        color: var(--text-muted);
    }
</style>