<script lang="ts">
    import { t } from 'svelte-i18n';
    import { link } from 'svelte-spa-router';
    import { lang } from '../service/i18n.setup';
    import Footer from '../components/ui/Footer.svelte';
    
    interface Props {
        params?: { name?: string };
    }

    let { params = {} }: Props = $props();

    const code = lang.startsWith('de') ? '_de' : '';
</script>

<main class="content">
    <div class="titlebar">
        <i class="bx bx-file"></i>&nbsp; { $t(`start.${params.name}`) }
    </div>
    <object title="Embedded document" data="/docs/{params.name}{code}.html">
    </object>
    <Footer>
        <a use:link href="/docs/imprint">{ $t('start.imprint') }</a> |
        <a use:link href="/docs/privacypolicy">{ $t('start.privacypolicy') }</a> |
        <a use:link href="/docs/termsofuse">{ $t('start.termsofuse') }</a> |
        <a use:link href="/settings">{ $t('settings.title') }</a>
    </Footer>
</main>

<style lang="scss">
    main {
        overflow: hidden;

        div.titlebar {
            position: absolute;
            width: 100%;
        }
        
        object {
            padding-top: 2.2em;
            width: 100%;
            height: calc(100% - 2.2em - 3.6em);
            overflow-x: hidden;
            overflow-y: visible;
        }
    }
</style>