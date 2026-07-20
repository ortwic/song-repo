<script lang="ts">
    import { t, json } from 'svelte-i18n';
    import { content } from '../store/menu-context.svelte';
    
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();

    const messages = $json('notfound.messages');
    const no = Math.floor(Math.random() * Object.keys(messages).length );
</script>

<div use:content>
    <h2>
        <i class="bx bx-error"></i>
        404 &ndash; { $t('notfound.title') }
    </h2>
    <h4>
        {#if children}
            {@render children()}
        {:else}
            { messages[no] }
        {/if}
    </h4>
    <img src="error.jpg" title="{$t('notfound.title')}" alt="{$t('notfound.title')}">
</div>

<style>
    h2 {
        display: flex;
        align-items: center;
        gap: 0.5em;
        color: var(--accent);
    }

    div {
        margin: 1em;
    }

    img {
        max-width: 100%;
        border: 1px solid var(--border);
    }

    @media (prefers-color-scheme: dark) {
        img {
            filter: invert();
        }
    }
</style>