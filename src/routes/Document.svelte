<script lang="ts">
    import { t } from 'svelte-i18n';
    
    export let params: { name?: string } = {};
</script>

<main class="content">
    <div class="titlebar">
        <i class="bx bx-file"></i>&nbsp; { $t(`start.${params.name}`) }
    </div>
    <object title="Embedded document" data="/docs/{params.name}.html#{navigator.language}">
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
            overflow: visible;
        }
    }
</style>