<script lang="ts">
    import { t } from "svelte-i18n";
    import type { DownloadOptions, DownloadType } from "tabulator-tables";
    import FileIcon from "../ui/elements/FileIcon.svelte";
    import { currentUser } from "../../service/auth.service";
    import { tableView } from "../../store/app.store";
    import { showError, showInfo } from "../../store/notification.store";
    export let exportTitle = 'export';

	async function copyLink(): Promise<void> {
		try {
			const link = `${location.origin}/#/songs/@${$currentUser.uid}`;
			await navigator.clipboard.writeText(link);
			showInfo($t('profile.share-link-copied'));
		} catch (error) {
			showError(error);
		}
	}

    async function downloadPdf() {
        if (!window['jspdf']) {
            const { default: jsPDF } = await import('jspdf');
            await import('jspdf-autotable');
            
            // Tabulator expects this, see https://github.com/olifolkerd/tabulator/issues/4239
            window['jspdf'] = { jsPDF };
        }

        download('pdf', { title: exportTitle });
    }

    function download(type: DownloadType, params?: DownloadOptions): void {
        try {
            $tableView?.table.download(type, `${exportTitle}.${type}`, params);
        } catch (error) {
            showError(error.message);            
        }
    }

</script>

<svelte:head>
  <script async type="text/javascript" src="https://oss.sheetjs.com/sheetjs/xlsx.full.min.js"></script>
</svelte:head>

<section class="menu">
	<div class="row">
		<button title="{ $t('profile.share-link') }" on:click={copyLink}>
			<i class='bx bx-share-alt'></i> { $t('profile.share-link') }
		</button>
	</div>
    <div class="row">
        <button data-target='columns' title="{ $t('menu.table.set-view') }">
            <i class="bx bx-columns"></i> { $t('menu.table.set-view') }
        </button>
    </div>
    <div class="row">
        <button class="icon-export" data-close title="Export CSV" on:click={() => download('csv', { delimiter: ';' })}>
            <FileIcon type="CSV" fill="LimeGreen"></FileIcon>
        </button>
        <button class="icon-export" data-close title="Export JSON" on:click={() => download('json')}>
            <FileIcon type="JSON" fill="SlateBlue" letterSpacing="-10px" style="condensed"></FileIcon>
        </button>
        <button class="icon-export" data-close title="Export XLSX" on:click={() => download('xlsx', { sheetName: exportTitle })}>
            <FileIcon type="XLSX" fill="SeaGreen" letterSpacing="-8px" style="condensed"></FileIcon>
        </button>
        <button class="icon-export" data-close title="Export PDF" on:click={downloadPdf}>
            <FileIcon type="PDF" fill="firebrick" letterSpacing="5px"></FileIcon>
        </button>
    </div>
</section>

<style lang="scss">
    button.icon-export {
        padding: 0;
    }

    button:disabled {
        opacity: .5;
    }
</style>