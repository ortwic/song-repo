<script lang="ts">
    import { t } from 'svelte-i18n';
    import { link, push } from 'svelte-spa-router';
    import { content } from '../store/menu-context.svelte';
    import { interceptInternalLinks } from '../components/actions/intercept-internal-links.action';
    import Footer from '../components/ui/Footer.svelte';
    import Titlebar from '../components/ui/elements/Titlebar.svelte';
    import { getPage } from '../service/common/page.service';
    import NotFound from './NotFound.svelte';
    
    interface Props {
        params?: { id?: string };
    }

    let { params = {} }: Props = $props();

    const page = $derived(getPage(params.id));
</script>

<main use:content={{ overflow: 'auto' }}>
{#key params.id}
    <Titlebar onClose={() => push('/')}>
        <i class="bx bx-file"></i>&nbsp; {page?.title ?? $t('notfound.title')}
    </Titlebar>
    {#if page}
        <div class="body" use:interceptInternalLinks={(path: string) => push(path)}>
            {@html page.body}
        </div>
    {:else}
        <NotFound />
    {/if}
    <Footer>
        <a use:link href="/docs/imprints">{ $t('start.imprint') }</a> |
        <a use:link href="/docs/privacypolicy">{ $t('start.privacypolicy') }</a> |
        <a use:link href="/docs/termsofuse">{ $t('start.termsofuse') }</a>
    </Footer>
{/key}
</main>

<style lang="scss">
    main {
        overflow-x: hidden;
        overflow-y: visible;

        .body {
            padding: 0 1em;
        }
    }
</style>