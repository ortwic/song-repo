<script lang="ts">
    import { marked } from 'marked';
    import { t } from 'svelte-i18n';
    import { untrack } from 'svelte';
    import { push, location, querystring } from '@keenmate/svelte-spa-router';
    import type { PostContent, Post } from '../../model/post.model';
    import { currentUser } from '../../service/user/auth.service';
    import { logPageView } from '../../store/notification.store';
    import NotFound from '../../routes/NotFound.svelte';
    import { registerDialog } from '../dialog-context.svelte';
    import IFrame from '../ui/elements/IFrame.svelte';
    import Image from '../ui/elements/Image.svelte';
    import { toClipboard } from '../ui/helper/input.helper';
    import DialogBase from './DialogBase.svelte';
    
    interface Props {
        id?: string;
        title?: string;
        content?: PostContent[];
    }

    let {
        id,
        title,
        content = []
    }: Props = $props();

    const options = { mangle: false, headerIds: false };
    let visible = $state(false);
    let post = $derived<Post>({ id, title, content } as Post);
    const size = $derived(post?.content?.length ? 'full' : 'auto');
    const slugOrId = $derived(post?.slug ?? post?.id ?? '');
    const shareLink = $derived(window.location.origin + `#/blog/${slugOrId}`);
    let consent = $derived(Boolean($currentUser));

    registerDialog('BlogPostDialog', showDialog);
    
    $effect(() => {
        const loc = location();
        if (untrack(() => visible)) {
            // history.back() was invoked
            visible = loc.indexOf(post.id) > 0;
        }
    });

    export async function showDialog(args?: Post) {
        post = args;
        visible = true;
        logPageView({ page: 'blog', title });
        return Promise.resolve();
    }

    function handleClose(): void {
        visible = false;
        const query = querystring() && `?${querystring()}` || '';
        push('/blog' + query);
    }
</script>

<DialogBase {visible} {size} type='view' onClose={handleClose}>
    {#snippet header()}
        <i class="bx bx-detail"></i> {post?.title ?? $t('notfound.title')}
    {/snippet}
    {#snippet controls()}
        <button class="titlebar-button" title="{$t('profile.share-link')}" onclick={() => toClipboard(shareLink)}>
            <i class="bx bx-share-alt"></i> 
        </button>
    {/snippet}
    {#if post?.content?.length}
        <section>
        {#each post.content as entry}
            {#if entry.type === 'youtube'}
            <IFrame src="https://www.youtube.com/embed/{entry.value.id}"
                    title={entry.value.title ?? ''}
                    {consent}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    width={560}
                    height={315}
            />
            <br />
            {:else if entry.type === 'quote'}
            <blockquote>
                {entry.value.text}
                <br />
                <cite>{entry.value.cite}</cite>
            </blockquote>
            {:else if entry.type === 'images'}
                {#each entry.value as src}
                    <Image {src} title={src?.split('/')?.at(-1)} size={480} ratio={21/9} />
                    <br />
                {/each}
            {:else}
            <p class="content">{@html marked(`${entry.value}`, options)}</p>
            {/if}
        {/each}
        </section>
    {:else}
    <NotFound />
    {/if}
</DialogBase>

<style lang="scss">
    section {
        padding: 1em 5%;
        height: 100%;
    }
</style>