<script lang="ts">
    import { t } from 'svelte-i18n';
    
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();

    const no = Math.floor(Math.random() * $t('notfound.messages').length );
</script>

<div>
    <h2>{ $t('notfound.title') }</h2>
    <p>
        { $t(`notfound.messages.${no}`) }
    </p>
    <p style="color: red">
        {#if children}
            {@render children()}
        {:else}
            <img src="error.jpg" title="{$t('notfound.title')}" alt="{$t('notfound.title')}">
        {/if}
    </p>
</div>

<style>
    h2 {
        color: var(--accent);
    }

    div {
        margin: 1em;
    }

    img {
        max-width: 100%;
    }

    @media (prefers-color-scheme: dark) {
        img {
            filter: invert();
        }
    }
</style>