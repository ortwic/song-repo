<script lang="ts">
    import { t } from 'svelte-i18n';
    import { link, push } from 'svelte-spa-router';
    import { interceptInternalLinks } from '../components/actions/intercept-internal-links';
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

<main class="content">
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
        overflow: hidden;

        div.body {
            padding: 0 1em;
            width: 100%;
            height: calc(100% - 2.2em - 3.6em);
            overflow-x: hidden;
            overflow-y: visible;
        }
    }
</style>