<script lang="ts">
    import { link } from 'svelte-spa-router';
    import { blogService } from '../../service/common/blog.service';
    import TagCloud from '../ui/elements/TagCloud.svelte';
    import { onMount } from 'svelte';

    let tags = $state<Map<string, { count: number }>>(new Map());

    onMount(() => {
        const sub = blogService.tagIndex$
            .subscribe(value => tags = value);

        return () => sub.unsubscribe();
    });
</script>

<section class="menu">
    <TagCloud index={tags}>
        {#snippet item(tag)}
            <a href="/blog/{tag}" use:link>{tag}</a>
        {/snippet}
    </TagCloud>
</section>
