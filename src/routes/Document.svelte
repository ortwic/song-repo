<script lang="ts">
    import { t } from 'svelte-i18n';
    import { lang } from '../service/i18n';
    
    export let params: { name?: string } = {};

    const code = lang.startsWith('de') ? '_de' : '';
</script>

<main class="content">
    <div class="titlebar">
        <i class="bx bx-file"></i>&nbsp; { $t(`start.${params.name}`) }
    </div>
    <object title="Embedded document" data="/docs/{params.name}{code}.html">
    </object>
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
            height: calc(100% - 2.2em);
            overflow-x: hidden;
            overflow-y: visible;
        }
    }
</style>