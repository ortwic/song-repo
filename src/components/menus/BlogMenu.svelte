<script lang="ts">
    import { t } from 'svelte-i18n';
    import { onMount } from 'svelte';
    import { link, push } from '@keenmate/svelte-spa-router';
    import { blogService } from '../../service/common/blog.service';
    import MenuButton from '../ui/elements/MenuButton.svelte';
    import TagCloud from '../ui/elements/TagCloud.svelte';

    let tags = $state<Map<string, { count: number }>>(new Map());

    onMount(() => {
        const sub = blogService.tagIndex$
            .subscribe(value => tags = value);

        return () => sub.unsubscribe();
    });
</script>

<section class="menu">
    <div class="row">
        <MenuButton onclick={() => push('/blog')}>
            <i class="bx bx-book-open"></i>
            {$t('blog.all-entries')}
        </MenuButton>
    </div>
    <TagCloud index={tags}>
        {#snippet item(tag)}
            <a href="/blog?tag={tag}" use:link>{tag}</a>
        {/snippet}
    </TagCloud>
</section>
