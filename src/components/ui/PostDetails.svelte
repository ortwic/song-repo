<script lang="ts">
    import { preventDefault } from 'svelte/legacy';

    import { t } from 'svelte-i18n';
    import ConfirmDialog from '../dialogs/ConfirmDialog.svelte';
    import { logPageView } from '../../store/notification.store';
    import type { Content } from '../../model/post.model';
    import { marked } from 'marked';
    
    interface Props {
        title: string;
        excerpt: string;
        content?: Content[];
        visible?: boolean;
        showMore?: boolean;
    }

    let {
        title,
        excerpt,
        content = [],
        visible = $bindable(false),
        showMore = true
    }: Props = $props();

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
        <button class="more" onclick={preventDefault(show)}>{ $t('blog.more') }</button>
    {/if}
</summary>

{#if visible}
<ConfirmDialog size="full" onClose={hide}>
    {#snippet header()}
        <i class="bx bx-detail"></i> {title} 
    {/snippet}
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

    {#snippet footer()}
            
            <div class="row">
                <button onclick={preventDefault(hide)}>
                    { $t('blog.back') }
                </button>
            </div>
        
            {/snippet}
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