<script lang="ts">
    import { t } from 'svelte-i18n';
    import ConfirmDialog from '../dialogs/ConfirmDialog.svelte';
    import { logPageView } from '../../store/notification.store';
    import type { Content } from '../../model/post.model';
    import { marked } from 'marked';
    
    export let title: string;
    export let excerpt: string;
    export let content: Content[] = [];
    export let visible = false;
    export let showMore = true;

    const options = { mangle: false, headerIds: false };

    function show() {
        visible = true;
        logPageView({ page: 'blog', title });
    }

    function hide() {
        visible = false;
    }
</script>

<h2>{title}</h2>

<summary>
    <span class="content">{excerpt}</span>
    {#if showMore}
        <button class="more" on:click|preventDefault={show}>{ $t('blog.more') }</button>
    {/if}
</summary>

{#if visible}
<ConfirmDialog size="full" on:closed={hide}>
    <svelte:fragment slot="title">
        <i class="bx bx-detail"></i> {title} 
    </svelte:fragment>

    <section>
    {#each content as entry}
        {#if entry.type === 'youtube'}
        <iframe loading="lazy" src="https://www.youtube.com/embed/{entry.value.id}" title={entry.value.title ?? ''}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen width="560" height="315" frameborder="0"></iframe>
            <br />
        {:else if entry.type === 'quote'}
        <blockquote>
            {entry.value.text}
            <br />
            <cite>{entry.value.cite}</cite>
        </blockquote>
        {:else if entry.type === 'images'}
            {#each entry.value as src}
                <img {src} alt={src?.split('/')?.at(-1)} />
                <br />
            {/each}
        {:else}
        <p class="content">{@html marked(`${entry.value}`, options)}</p>
        {/if}
    {/each}
    </section>

    <svelte:fragment slot="footer">
        <div class="row">
            <button on:click|preventDefault={hide}>
                { $t('blog.back') }
            </button>
        </div>
    </svelte:fragment>
</ConfirmDialog>
{/if}

<style lang="scss">
    h2 {
        margin: .3em 0;
        transition: all .2s ease-in-out;
    }

    section {
        padding: 1em 5%;
        height: 100%;
        
        overflow-y: auto; 
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