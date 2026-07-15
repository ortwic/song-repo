<script lang="ts">
    import { t } from 'svelte-i18n';
    import { marked } from 'marked';
    import Avatar from '../components/ui/Avatar.svelte';
    import Footer from '../components/ui/Footer.svelte';
    import type { UserProfileView } from '../model/user.model';
    import UserService from '../service/user/user.service';
    import { setAppReady } from '../store/app.store';
    import NotFound from './NotFound.svelte';

    interface Props {
        params?: { alias?: string };
    }

    let { params = {} }: Props = $props();

    let profile = $state<UserProfileView>();

    $effect(() => {
        const { unsubscribe } = new UserService().getProfileWithLinks(params.alias).subscribe((value) => {
            profile = value;
            setAppReady();
        });

        return () => unsubscribe();
    });
</script>

<main class="content">
    {#if profile?.id}
        <h2>
            <Avatar photoURL={profile.photoURL} title={profile.name} />
            {profile.name}
        </h2>

        <p class="about">{@html marked(profile.about ?? '', { mangle: false, headerIds: false })}</p>
        
        <section class="linktree">
            <a class="link primary" role="button" href="/#/songs/{profile.id}">
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
                    alias: params.alias 
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

    .linktree {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: 1.5rem 0.5rem;
        width: 100%;
    }

    a[role='button'].link {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        padding: 0.85rem 1.1rem;
        border-radius: 14px;
        border-left: 4px solid transparent;
        background: linear-gradient(0deg, var(--surface-light), var(--surface));
        color: var(--text);
        box-shadow: var(--shadow-sm);
        transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, background-color 0.15s ease;
    
        &:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
            border-left-color: var(--accent);
            background: linear-gradient(90deg, var(--surface-light), var(--surface));
        }

        .icon-badge {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 2rem;
            height: 2rem;
            flex-shrink: 0;
            border: 1px solid var(--border);
            border-radius: 50%;
            background-color: var(--icon-bg);
            color: var(--accent);
        }

        &.primary {
            color: var(--surface);
            background: linear-gradient(0deg, var(--accent), var(--accent-t));
            border-left-color: transparent;

            &:hover {
                background-color: var(--accent-muted);
                border-left-color: transparent;
                transform: translateY(-2px);
            }

            .icon-badge {
                background-color: var(--surface);
                color: var(--accent);
            }
        }
    }
</style>