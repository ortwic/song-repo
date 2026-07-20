<script lang="ts">
    import { t } from "svelte-i18n";
    import { link, location } from "@keenmate/svelte-spa-router";
    import { menuContext } from "../../store/menu-context.svelte";
    
    let {
        minimal = false,
        children
    }: { 
        minimal?: boolean; 
        children?: import('svelte').Snippet 
    } = $props();
    
    function toggleMenu(e: Event) {
        (e.target as HTMLElement).blur();
        menuContext.toggleMenu();
    }

</script>


{#if minimal}
    <button class="clear float" onclick={toggleMenu}
        title={menuContext.isVisible() ? $t('menu.close') : $t('menu.open')}>
        <i class="icon shadow bx bx-sidebar bx-flip-horizontal"></i>
    </button>
{:else}
<div class="titlebar">
    <span class="text">
        {@render children?.()}
    </span>
    {#if location() !== '/'}
    <a use:link class="titlebar-button" href="/" title="{ $t('start.hello') }">
        <i class="bx bx-user-circle"></i>
    </a> 
    {/if}
    {#if !location().startsWith('/songs')}
    <a use:link class="titlebar-button" href="/songs" title="{ $t('menu.repo') }">
        <i class="bx bxs-playlist"></i>
    </a> 
    {/if}
    {#if !location().startsWith('/snippets')}
    <a use:link class="titlebar-button" href="/snippets" title="{ $t('menu.snippets') }">
        <i class="bx bx-bulb"></i>
    </a> 
    {/if}
    {#if !location().startsWith('/blog')}
    <a use:link class="titlebar-button" href="/blog" title="{ $t('menu.howto') }">
        <i class="bx bx-book-open"></i>
    </a> 
    {/if}
    {#if location() !== '/events'}
    <a use:link class="titlebar-button" href="/events" title="{ $t('menu.events') }">
        <i class="bx bx-calendar"></i>
    </a>
    {/if}
    {#if location() !== '/settings'}
    <a use:link class="titlebar-button" href="/settings" title={$t('settings.title')}>
        <i class="bx bx-cog"></i>
    </a>
    {/if}
    <button class="titlebar-button" title={$t('menu.open')} onclick={toggleMenu}>
        <i class="bx bx-sidebar bx-flip-horizontal"></i>
    </button>
</div>
{/if}

<style lang="scss">
    .float {
        position: fixed;
        right: 0;
        top: 0;
        padding: 0.4em 0.6em;
        z-index: 80;
    }

    .titlebar {
        position: sticky;
        top: 0;
        left: 0;
        right: 0;
        z-index: 80;
    }

    .shadow {
        box-shadow: var(--shadow-md);
        border-radius: 50%;
    }
</style>