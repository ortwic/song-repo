<script lang="ts">
    import { t } from 'svelte-i18n';
    import { marked } from 'marked';
    import { of, startWith, switchMap, map } from 'rxjs';
    import type { UserLink } from '../model/user.model';
    import UserService from '../service/user/user.service';
    import { UserLinkService } from '../service/user/user-link.service';
    import Avatar from '../components/ui/Avatar.svelte';
    import LoadingBar from '../components/ui/elements/LoadingBar.svelte';
    import NavButton from '../components/ui/elements/NavButton.svelte';
    import Footer from '../components/ui/Footer.svelte';
    import NotFound from './NotFound.svelte';

    interface Props {
        params?: { alias?: string };
    }

    let { params = {} }: Props = $props();

    const userService = new UserService();
    const profile$ = userService.getProfileByAlias(params.alias);
    const links$ = userService.getProfileByAlias(params.alias).pipe(
        switchMap((p) => (p?.id ? new UserLinkService(p.id).userlinks$ : of([]))),
        startWith([] as UserLink[])
    );

</script>

<main class="content">
    <LoadingBar isLoading={$profile$?.id === undefined}>
    {#if $profile$?.id !== undefined}
        <h2>
            <Avatar photoURL={$profile$.photoURL} title={$profile$.name} />
            {$profile$.name}
        </h2>

        <p class="about">{@html marked($profile$.about ?? '')}</p>

        <section class="menu">
            <NavButton href="/songs/@{$profile$.id}">
                <span>
                    <i class="bx bxs-playlist"></i>
                    {$t('user.song-list')}
                </span>
            </NavButton>

            {#each $links$ as link}
                <div class="row">
                    <a role="button" href={link.url} target="_blank">
                        <span>
                            <i class="bx {link.icon}"></i>
                            {link.title}
                        </span>
                    </a>
                </div>
            {/each}
        </section>
    {:else}
        <NotFound>
            <p>{$t('user.alias-unknown')}</p>
        </NotFound>
    {/if}
    </LoadingBar>
    <p>
        <Footer />
    </p>
</main>

<style>
    h2 {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5em;
        color: var(--accent);
    }

    .about {
        padding: 0 1em;
    }
</style>
