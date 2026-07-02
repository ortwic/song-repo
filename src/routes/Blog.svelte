<script lang="ts">
    import { link, querystring } from 'svelte-spa-router';
    import { t } from 'svelte-i18n';
    import { openDialog } from '../components/dialog-context.svelte';
    import TitlebarMenu from '../components/menus/TitlebarMenu.svelte';
    import Image from '../components/ui/elements/Image.svelte';
    import type { Post } from '../model/post.model';
    import { blogService } from '../service/common/blog.service';
    import { logPageView } from '../store/notification.store';
    import { orientation } from '../store/media.store';
    
    interface Props {
        params?: { slug?: string };
    }

    let { 
        params = {}
    }: Props = $props();

    const width = $derived($orientation === 'landscape' ? 120 : 80);
    const tag = $derived(new URLSearchParams($querystring).get('tag'));

    let posts = $state<Post[]>([]);

    $effect(() => {
        const source$ = tag ? blogService.byTag(tag) : blogService.posts$;
        const subscription = source$.subscribe((result) => {
            posts = result;
        });
        return () => subscription.unsubscribe();
    });

    $effect(() => {
        if (params?.slug) {
            const subscription = blogService.bySlugOrId(params?.slug)
                .subscribe((post) => openDialog('BlogPostDialog', post));
            return () => subscription.unsubscribe();
        }
    });

    $effect(() => {
        logPageView({ page: 'blog', filter: tag });
    });

    function more(post: Post) {
        const query = $querystring && `?${$querystring}` || '';
        return `/blog/${post.slug ?? post.id}${query}`;
    }
</script>

<svelte:head>
    <title>{$t('menu.howto')} blog | Song-Repo</title>
</svelte:head>

<main class="content">
    <TitlebarMenu>
        <i class="bx bx-music"></i>&nbsp; {$t('blog.title')}
    </TitlebarMenu>
    {#each posts as post}
        <div class="post">
            {#if post.images?.length}
                <div class="thumbnail">
                    <Image src={post.images[0]?.value} size={width} />
                </div>
            {/if}
            <h2>{post.title}</h2>
            <summary>
                <span class="content">{post.excerpt}</span>
                <a role="button" use:link class="clear more" href={more(post)}>
                    {$t('blog.more')}
                </a>
            </summary>
            <div>
                {#each post.tags as tag}
                    <a href="#/blog?tag={tag}" class="label">{tag}</a>
                {/each}
            </div>
        </div>
    {/each}
</main>

<style lang="scss">
    main {
        color: var(--text);

        div.post {
            border-color: var(--border);
            border-style: solid;
            border-width: 1px 0 1px 0;
            padding: 0.4rem;

            .thumbnail {
                float: left;
                margin-right: 0.4rem;
            }

            h2 {
                margin: .3em 0;
                transition: all .2s ease-in-out;
            }
            
            a.label {
                display: inline-block;
                margin: 0.6rem 0.3rem;
            }

            .more {
                padding: 0;
                border: 0;
                background-color: transparent;
                text-align: left;

                &::before {
                    content: '[';
                    padding-right: 2px;
                }

                &::after {
                    content: ']';
                    padding-left: 2px;
                }
            }
            
            @media screen and (orientation: portrait) {
                padding-right: 1rem;

                h2 {
                    font-size: 13pt;
                }

                .content, .more {
                    font-size: 11pt;
                }
            }
        }
    }
</style>
