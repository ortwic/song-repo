<script lang="ts">
    import FileIcon from "../ui/elements/FileIcon.svelte";
    import { downloadQueue, type DowloadItem } from '../../store/download.store';

    export let exportTitle = 'export';

    const csv: DowloadItem = { type: 'csv', params: { delimiter: ';' } };
    const json: DowloadItem = { type: 'json' };
    
    async function downlaodXlsx() {
        downloadQueue.push({ type: 'xlsx', params: { sheetName: exportTitle } });
    }

    async function downlaodPdf() {
        if (!window['jspdf']) {
            const { default: jsPDF } = await import('jspdf');
            await import('jspdf-autotable');
            
            // Tabulator expects this, see https://github.com/olifolkerd/tabulator/issues/4239
            window['jspdf'] = { jsPDF };
        }

        downloadQueue.push({ type: 'pdf', params: { title: exportTitle } });
    }

</script>

<svelte:head>
  <script async type="text/javascript" src="https://oss.sheetjs.com/sheetjs/xlsx.full.min.js"></script>
</svelte:head>

<section class="menu">
    <div class="row">
        <button class="icon-export" data-close title="Export CSV" on:click={() => downloadQueue.push(csv)}>
            <FileIcon type="CSV" fill="LimeGreen"></FileIcon>
        </button>
        <button class="icon-export" data-close title="Export JSON" on:click={() => downloadQueue.push(json)}>
            <FileIcon type="JSON" fill="SlateBlue" letterSpacing="-10px" style="condensed"></FileIcon>
        </button>
        <button class="icon-export" data-close title="Export XLSX" on:click={downlaodXlsx}>
            <FileIcon type="XLSX" fill="SeaGreen" letterSpacing="-8px" style="condensed"></FileIcon>
        </button>
        <button class="icon-export" data-close title="Export PDF" on:click={downlaodPdf}>
            <FileIcon type="PDF" fill="firebrick" letterSpacing="5px"></FileIcon>
        </button>
    </div>
</section>

<style>
    button.icon-export {
        padding: 0;
    }

    button:disabled {
        opacity: .5;
    }
</style>