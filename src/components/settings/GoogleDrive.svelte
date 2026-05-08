<script lang="ts">
    import { t } from 'svelte-i18n';
    import Switch from '../ui/elements/Switch.svelte';
    import { googleDriveService } from '../../service/storage/google-drive.service';
    import { showError } from '../../store/notification.store';
    import { settings, saveSettings } from '../../store/user-settings.svelte';

    // Avoid storing a reference to settings.googleDrive!
    // assignment captures the object at init time and won't 
    // reflect later replacements of the property.
    let loadingFolder = $state(false);

    function updateSettings() {
        saveSettings('googleDrive', settings.googleDrive);
    }

    async function pickFolder() {
        loadingFolder = true;
        try {
            const folder = await googleDriveService.openFolderPicker({
                title: $t('settings.drive.select-default-folder'),
            });
            if (folder) {
                settings.googleDrive.rootFolderId = folder.id;
                settings.googleDrive.rootFolderName = folder.name;
                updateSettings();
            }
        } catch (e) {
            showError(e instanceof Error ? e.message : $t('settings.drive.error'));
        } finally {
            loadingFolder = false;
        }
    }

    function clearFolder() {
        settings.googleDrive.rootFolderId = '';
        settings.googleDrive.rootFolderName = '';
        updateSettings();
    }

    function toggleViewMode() {
        settings.googleDrive.viewMode = settings.googleDrive.viewMode === 'grid' ? 'list' : 'grid';
        updateSettings();
    }

    function toggleShowFolders(value: unknown) {
        settings.googleDrive.showFolders = value as boolean;
        updateSettings();
    }
</script>

<div class="section grid">
    <label for="default-folder">{$t('settings.drive.default-folder')}</label>
    <div class="folder-row">
        <button
            class="gdrive-btn no-wrap"
            class:loading={loadingFolder}
            disabled={loadingFolder}
            onclick={pickFolder}
            type="button"
        >
            <span class="gdrive-icon">
                {#if loadingFolder}
                    <span class="spinner"></span>
                {:else}
                    <img src="icons/google-drive.svg" alt="Google Drive" />
                {/if}
            </span>
            <span>
                {loadingFolder
                    ? $t('settings.drive.loading')
                    : settings.googleDrive.rootFolderName || $t('settings.drive.set-folder')}
            </span>
        </button>
        {#if settings.googleDrive.rootFolderName}
            <button class="clear" onclick={clearFolder} type="button" aria-label={$t('settings.drive.clear-folder')}>
                <i class="bx bx-trash"></i>
            </button>
        {/if}
    </div>

    <label for="view-mode">{$t('settings.drive.view-mode')}</label>
    <span class="switch-row">
        <Switch
            title={$t('settings.drive.view-mode')}
            state={settings.googleDrive.viewMode}
            icon={settings.googleDrive.viewMode === 'grid' ? 'bx-grid-alt' : 'bx-list-ul'}
            options={['grid', 'list']}
            onToggle={toggleViewMode}
        />
        <span>{$t(`settings.drive.view-${settings.googleDrive.viewMode}`)}</span>
    </span>

    <label for="navigation">{$t('settings.drive.navigation')}</label>
    <span class="switch-row">
        <Switch
            title={$t('settings.drive.show-folders')}
            state={settings.googleDrive.showFolders}
            icon={settings.googleDrive.showFolders ? 'bx-check' : 'bx-minus'}
            options={[false, true]}
            onToggle={toggleShowFolders}
        />
        <span>{$t('settings.drive.show-folders')}</span>
    </span>
</div>

<style>
    .folder-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    .gdrive-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.375rem 0.75rem;
        white-space: nowrap;
    }

    .gdrive-icon {
        display: flex;
        align-items: center;
        width: 18px;
        height: 18px;
        flex-shrink: 0;
    }

    .switch-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
</style>