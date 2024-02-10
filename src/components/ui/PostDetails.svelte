<script lang="ts">
    import { t } from 'svelte-i18n';
    import { slide } from 'svelte/transition';
    import { logPageView } from '../../store/notification.store';
    import type { PostContent } from '../../model/post.model';
    import { marked } from 'marked';
    
    export let title: string;
    export let excerpt: string;
    export let content: PostContent[] = [];
    export let collapsed = true;
    export let showMore = true;

    const options = { mangle: false, headerIds: false };

    function toggle() {
        collapsed = !collapsed;
        if (!collapsed) {            
            logPageView({ page: 'blog', title });
        }
    }
</script>

<h2>{title}</h2>

{#if collapsed}
<summary in:slide={{ duration: 200 }} out:slide={{ duration: 200 }}>
    <span class="content">{excerpt}</span>
    {#if showMore}
        <button class="more" on:click|preventDefault={toggle}>{ $t('blog.more') }</button>
    {/if}
</summary>
{:else}
<div in:slide={{ duration: 200 }} out:slide={{ duration: 200 }} >
    {#each content as entry}
        <span class="content">{@html marked(entry.value, options)}</span>
    {/each}
    <div>
        <button class="more" on:click|preventDefault={toggle}>{ $t('blog.less') }</button>
    </div> 
</div>
{/if}

<style lang="scss">
    h2 {
        margin: .3em 0;
        transition: all .2s ease-in-out;
    }

    button.more {
        padding: 0;
        border: 0;
        background-color: transparent;
        box-shadow: unset;
        text-align: left;

        &::before {
            content: '[';
            padding-right: 2px;
        }

        &::after {
            content: ']';
            padding-left: 2px;
        }
    }

    @media screen and (orientation: portrait) {
        h2 {
            font-size: 13pt;
        }

        .content, .more {
            font-size: 11pt;
        }
    }
</style>