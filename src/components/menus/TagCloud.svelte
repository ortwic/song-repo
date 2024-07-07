<script lang="ts">
    import { link } from "svelte-spa-router";
    import { map } from "rxjs";
    import { getBlogPosts } from "../../service/blog.service";
    import type { Post } from "../../model/post.model";
    
    const tags = getBlogPosts().pipe(map(countTags));

    function countTags(items: Post[]) {
        const map = items.map(p => p.tags).flat().reduce((acc, tag) => {
            acc.has(tag) ? acc.set(tag, acc.get(tag) + 1) : acc.set(tag, 1);
            return acc;
        }, new Map<string, number>());
        return new Map([...map.entries()].sort((a, b) => b[1] - a[1]));
    }
</script>

<section class="menu">
    {#each $tags as tag}
    <div title="n={`${tag[1]}`}" style="font-size: {tag[1] * 4 + 6}px">
        <a href="/blog/{tag[0]}" use:link>{tag[0]}</a>
    </div>
    {/each}
</section>
