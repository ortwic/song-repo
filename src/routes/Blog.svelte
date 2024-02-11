<script lang="ts">
    import { t } from "svelte-i18n";
    import { derived } from "svelte/store";
    import Image from "../components/ui/elements/Image.svelte";
    import PostDetails from "../components/ui/PostDetails.svelte";
    import { getBlogPosts } from "../service/blog.service";
    import { logPageView } from "../store/notification.store";
    import { orientation } from "../store/media.store";
  
    export let params: { label?: string } = {};

    const width = derived(orientation, (o) => o === 'landscape' ? 120 : 80);
    const posts = getBlogPosts(params.label);
    if (params.label) {
        logPageView({ page: 'blog', filter: params.label });
    }
</script>
  
<svelte:head>
<title>{ $t('menu.howto') } blog | Song Repertory</title>
</svelte:head>

<main class="content">
    <div class="titlebar">
        <i class="bx bx-bulb"></i>&nbsp; { $t('blog.title') }
    </div>
    {#each $posts as post}
    <div class="post">
        {#if post.images?.length}
        <div class="thumbnail">
            <Image src={post.images[0]?.value} width={$width} height={$width} />
        </div>
        {/if}
        <PostDetails title={post.title} excerpt={post.excerpt} content={post.content}/>
        <div>   
            {#each post.tags as label}
            <a href="#/blog/{label}" class="label">{label}</a>
            {/each}
        </div>
    </div>
    {/each}
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