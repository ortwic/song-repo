<script lang="ts">
    import { t } from 'svelte-i18n';
    import { getContext } from 'svelte';
    import type { DownloadOptions, DownloadType } from 'tabulator-tables';
    import type { Dialog } from '../../model/dialog.model';
    import type { UserSong } from '../../model/song.model';
    import FileIcon from '../ui/elements/FileIcon.svelte';
    import SongService from '../../service/user/user-song.service';
    import { tableView } from '../../store/app.store';
    import { showError } from '../../store/notification.store';
    import { exportTableToPdf } from '../table/pdf-export';

    interface Props {
        exportTitle?: string;
    }

    let { exportTitle = 'export' }: Props = $props();

    const service = new SongService();
    const addSongDialog = getContext<Dialog<UserSong>>('editsong-dialog');

    async function addSong() {
        const newSong = await addSongDialog.open();
        if (newSong !== null) {
            await service.addSong(newSong);
        }
    }

    async function downloadPdf() {
        try {
            await exportTableToPdf($tableView?.table, exportTitle);
        } catch (error) {
            showError(error.message);
        }
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
        <button data-close title={$t('songs.add-new')} onclick={addSong}>
            <span><i class="bx bx-plus"></i> {$t('songs.add-new')}</span>
        </button>
    </div>
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
            onclick={() => download('xlsx', { sheetName: exportTitle })}
        >
            <FileIcon type="XLSX" fill="MediumSeaGreen" letterSpacing="-8px" style="condensed"></FileIcon>
        </button>
        <button class="icon-export" data-close title="Export PDF" onclick={downloadPdf}>
            <FileIcon type="PDF" fill="IndianRed" letterSpacing="5px"></FileIcon>
        </button>
    </div>
</section>

<style lang="scss">
    button.icon-export {
        padding: 0;
    }

    button:disabled {
        opacity: 0.5;
    }
</style>
