<script lang="ts">
    import Titlebar from "../components/ui/elements/Titlebar.svelte";
    import Image from "../components/ui/elements/Image.svelte";
    import LoadingBar from "../components/ui/elements/LoadingBar.svelte";
    import { createBlogService } from "../service/blog.service";
  
    export let params: { label?: string } = {};

    const entities = {
        'amp': '&',
        'apos': '\'',
        '#x27': '\'',
        '#x2F': '/',
        '#39': '\'',
        '#47': '/',
        'lt': '<',
        'gt': '>',
        'nbsp': ' ',
        'quot': '"'
    };

    const blogPosts = createBlogService(true)
        .then(service => service.getBlogPosts(params.label));

    function generateSnippet(html: string, maxWords = 12): string {
        const text = parseHtml(html)[0];
        if (text) {
            const sentences = text.match(/(.+[\.\?\!\n])\s/g);
            if (sentences) {
                const first = sentences[0].replace(/&([^;]+);/gm, (e, m) => entities[e] || m);
                const words = first.split(/\s/);
                if (first.length > maxWords) {
                    return words.splice(0, maxWords).join(' ') + ' ...';
                }

                return first.trim();
            }
        }
        return '';
    }

    function parseHtml(html: string) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const content = [];
        doc.querySelectorAll('*').forEach(e => content.push((e as HTMLElement).innerText));
        return content.filter(v => v);
    }

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
                    <a href="#/post/{post.id}">
                        <h2>{post.title}</h2>
                        <span>{generateSnippet(post.content)}</span>
                    </a>
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

    h1 {
        color: var(--primary);
    }

    div.post {
        border-color: silver;
        border-style: solid;
        border-width: 1px 0 1px 0;
        padding: 0 1rem;
        transition: all .2s ease-in-out;
    }

    div.post:hover {
        background-color: var(--primback);
    }

    div.post div.col a {
        color: var(--primtext);

        h2 {
            margin: .3em 0;
        }

        span {
            font-weight: normal;
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