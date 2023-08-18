<script lang="ts">
    import Titlebar from "../components/ui/elements/Titlebar.svelte";
    import Image from "../components/ui/elements/Image.svelte";
    import PostDetails from "../components/ui/PostDetails.svelte";
    import LoadingBar from "../components/ui/elements/LoadingBar.svelte";
    import { createBlogService } from "../service/blog.service";
  
    export let params: { label?: string } = {};

    const blogPosts = createBlogService(true)
        .then(service => service.getBlogPosts(params.label));

  </script>
  
  <svelte:head>
    <title>Making music blog | Song Repertory</title>
  </svelte:head>
    
<main class="content">
    <Titlebar closable={false}>Everthing about making music</Titlebar>
    {#await blogPosts}
    <p>
        <LoadingBar>loading...</LoadingBar>
    </p>
    {:then blogs}
        {#if blogs?.length}
            {#each blogs as post}
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
    {:catch error}
    <p style="color: red">{error.message}</p>
    {/await}
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

            span {
                font-weight: normal;
            }
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