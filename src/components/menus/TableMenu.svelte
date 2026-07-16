<script lang="ts">
    import type { DownloadOptions, DownloadType } from 'tabulator-tables';
    import FileIcon from '../ui/elements/FileIcon.svelte';
    import { tableContext } from '../table/table.svelte';
    import { showError } from '../../store/notification.store';
    import { exportTableToPdf } from '../table/pdf-export';

    async function downloadPdf() {
        const { table, exportAction } = tableContext;
        if (table) {
            try {
                await exportTableToPdf(table, exportAction.fileName);
            } catch (error) {
                showError(error.message);
            }
        }
    }

    function download(type: DownloadType, options?: DownloadOptions): void {
        const { table, exportAction } = tableContext;
        if (table) {
            try {
                table.download(type, `${exportAction.fileName}.${type}`, options);
            } catch (error) {
                showError(error.message);
            }
        }
    }
</script>

<svelte:head>
    <script async type="text/javascript" src="https://oss.sheetjs.com/sheetjs/xlsx.full.min.js"></script>
</svelte:head>

<section class="menu">
    {#if tableContext.addAction}
    <div class="row">
        <button data-close 
            title={tableContext.addAction.label} 
            onclick={tableContext.addAction.action}>
            <span><i class="bx bx-plus"></i> {tableContext.addAction.label}</span>
        </button>
    </div>
    {/if}
    {#if tableContext.exportAction}
    <div class="row">
        <button class="icon-export" data-close title="Export CSV" onclick={() => download('csv', { delimiter: ';' })}>
            <FileIcon type="CSV" fill="OliveDrab"></FileIcon>
        </button>
        <button class="icon-export" data-close title="Export JSON" onclick={() => download('json')}>
            <FileIcon type="JSON" fill="MediumPurple" letterSpacing="-10px" style="condensed"></FileIcon>
        </button>
        <button
            class="icon-export"
            data-close
            title="Export XLSX"
            onclick={() => download('xlsx', { sheetName: tableContext.exportAction.fileName })}
        >
            <FileIcon type="XLSX" fill="MediumSeaGreen" letterSpacing="-8px" style="condensed"></FileIcon>
        </button>
        <button class="icon-export" data-close title="Export PDF" onclick={downloadPdf}>
            <FileIcon type="PDF" fill="IndianRed" letterSpacing="5px"></FileIcon>
        </button>
    </div>
    {/if}
</section>

<style lang="scss">
    button.icon-export {
        padding: 0;
    }

    button:disabled {
        opacity: 0.5;
    }
</style>
