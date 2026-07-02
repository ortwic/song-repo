<script lang="ts">
    import { t } from 'svelte-i18n';
    import { link, push } from 'svelte-spa-router';
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
    <div class="row">
        <button data-close onclick={() => push('/blog')}>
            <i class="bx bx-music"></i>
            {$t('blog.all-entries')}
        </button>
    </div>
    <TagCloud index={tags}>
        {#snippet item(tag)}
            <a href="/blog?tag={tag}" use:link>{tag}</a>
        {/snippet}
    </TagCloud>
</section>
