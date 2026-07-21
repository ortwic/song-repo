<script lang="ts">
    import { t, json } from 'svelte-i18n';
    import { menu } from '../store/menu-context.svelte';
    
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();

    const messages = $json('notfound.messages');
    const no = Math.floor(Math.random() * Object.keys(messages).length );
</script>

<main use:menu.offset class="scrollable">
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
</main>

<style>
    main {
        margin: 1em;
    }

    h2 {
        display: flex;
        align-items: center;
        gap: 0.5em;
        color: var(--accent);
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