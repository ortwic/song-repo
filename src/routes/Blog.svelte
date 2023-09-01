<script lang="ts">
    import { onMount } from "svelte";
    import Titlebar from "../components/ui/elements/Titlebar.svelte";
    import Image from "../components/ui/elements/Image.svelte";
    import PostDetails from "../components/ui/PostDetails.svelte";
    import BlogService, { createBlogService } from "../service/blog.service";
    import { t } from "../service/i18n";
    import { logPageView } from "../store/notification.store";
  
    export let params: { label?: string } = {};

    let service: BlogService;
    let store;

    onMount(async () => {
        service = await createBlogService(true);
        store = await service.loadBlogPosts(params.label);
        if (params.label) {
            logPageView({ page: 'blog', filter: params.label });
        }
    });

    function scrollHandler({ target }): void {
        const threshold = target.offsetHeight * .25;
        if (target.offsetHeight + target.scrollTop >= target.scrollHeight - threshold) {
            service.loadBlogPosts();
        }
    }

</script>
  
<svelte:head>
<title>Making music blog | Song Repertory</title>
</svelte:head>

<main on:scroll={scrollHandler} class="content">
    <Titlebar closable={false}><i class="bx bx-bulb"></i>&nbsp; { $t('blog.title') }</Titlebar>
    {#if $store?.length}
        {#each $store as post}
        <div class="post card">
            {#if post.images?.length}
            <Image src={post.images[0].url} width={120} height={120} />
            {/if}
            <div class="col">
                <PostDetails title={post.title} html={post.content}/>
                <div>   
                    {#each post.labels as label}
                    <a href="#/blog/{label}" class="label">{label}</a>
                    {/each}
                </div>
            </div>
        </div>
        {/each}
    {:else}
    <div class="post">
        <p>Unable to load posts.</p>
    </div>
    {/if}
</main>
  
<style lang="scss">
main {
    color: var(--text);

    div.post {
        border-color: silver;
        border-style: solid;
        border-width: 1px 0 1px 0;

        div.col {
            color: var(--primtext);
            padding: 0 1rem;
            width: 100%;
        }
    }

    a.label {
        display: inline-block;
        margin: .6rem .3rem;
        padding: .2rem .6rem;
        font-weight: normal;
        transition: all .2s ease-in-out;
    }
}
</style>