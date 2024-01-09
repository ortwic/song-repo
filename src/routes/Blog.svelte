<script lang="ts">
    import { t } from "svelte-i18n";
    import { derived, type Readable } from "svelte/store";
    import type { blogger_v3 as B } from '@googleapis/blogger';
    import Titlebar from "../components/ui/elements/Titlebar.svelte";
    import Image from "../components/ui/elements/Image.svelte";
    import PostDetails from "../components/ui/PostDetails.svelte";
    import BlogService, { createBlogService } from "../service/blog.service";
    import { logPageView } from "../store/notification.store";
    import { orientation } from "../store/media.store";
  
    export let params: { label?: string } = {};

    const width = derived(orientation, (o) => o === 'landscape' ? 120 : 80);
    let service: BlogService;
    let store: Readable<B.Schema$Post[]>;

    async function loadBlogPosts() {
        service = await createBlogService(true);
        store = await service.loadBlogPosts(params.label);
        if (params.label) {
            logPageView({ page: 'blog', filter: params.label });
        }
    }

    function scrollHandler({ target }): void {
        const threshold = target.offsetHeight * .25;
        if (target.offsetHeight + target.scrollTop >= target.scrollHeight - threshold) {
            service.loadBlogPosts();
        }
    }

</script>
  
<svelte:head>
<title>{ $t('menu.howto') } blog | Song Repertory</title>
</svelte:head>

<main on:scroll={scrollHandler} class="content">
    <Titlebar closable={false}><i class="bx bx-bulb"></i>&nbsp; { $t('blog.title') }</Titlebar>
    {#await loadBlogPosts()}
        <div class="post">
            <p>{ $t('start.loading') }</p>
        </div>
    {:then}
        {#each $store as post}
        <div class="post">
            {#if post.images?.length}
            <div class="thumbnail">
                <Image src={post.images[0].url} width={$width} height={$width} />
            </div>
            {/if}
            <PostDetails title={post.title} html={post.content}/>
            <div>   
                {#each post.labels as label}
                <a href="#/blog/{label}" class="label">{label}</a>
                {/each}
            </div>
        </div>
        {/each}
    {:catch { code, message }}
        <div class="post">
            <div class="thumbnail">
                <Image src="./error.jpg" width={$width} height={$width} />
            </div>
            <PostDetails title={code} html={message} showMore={false} />
        </div>
    {/await}
</main>
  
<style lang="scss">
main {
    color: var(--text);

    div.post {
        border-color: silver;
        border-style: solid;
        border-width: 1px 0 1px 0;
        color: var(--primtext);
        padding: .4rem;

        .thumbnail {
            float: left;
            margin-right: .4rem;
        }

        a.label {
            display: inline-block;
            margin: .6rem .3rem;
            padding: .2rem .6rem;
            font-weight: normal;
            transition: all .2s ease-in-out;
        }

        @media screen and (orientation: portrait) {
            padding-right: 1rem;
        }
    }
}
</style>