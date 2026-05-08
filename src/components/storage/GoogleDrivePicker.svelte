<script lang="ts">
    import { t } from 'svelte-i18n';
    import type { DriveFile } from '../../model/file.model';
    import { googleDriveService } from '../../service/storage/google-drive.service';
    import { showError } from '../../store/notification.store';
    import { settings } from '../../store/user-settings.svelte';

    interface Props {
        disabled?: boolean;
        mimeTypes?: string[];
        uploadMimeTypes?: string;
        onPick: (file: DriveFile) => void;
        onCancel?: () => void;
    }

    const {
        disabled,
        mimeTypes,
        uploadMimeTypes = 'application/pdf,image/*,audio/*',
        onPick,
        onCancel,
    }: Props = $props();

    let loadingPicker = $state(false);
    let loadingUpload = $state(false);
    let fileInput: HTMLInputElement;

    async function openPicker() {
        loadingPicker = true;
        try {
            const file = await googleDriveService.openPicker({
                title: $t('songs.resource.select-title'),
                ...(mimeTypes ? { mimeTypes } : {}),
                showFolders: settings.googleDrive.showFolders,
                viewMode: settings.googleDrive.viewMode,
                rootFolderId: settings.googleDrive.rootFolderId,
            });
            if (file) {
                onPick(file);
            } else {
                onCancel?.();
            }
        } catch (e) {
            showError(e instanceof Error ? e.message : $t('songs.resource.drive-error'));
        } finally {
            loadingPicker = false;
        }
    }

    async function handleFileSelected() {
        for (const file of [...fileInput.files]) {
            loadingUpload = true;
            try {
                const driveFile = await googleDriveService.uploadFile(file, {
                    folderId: settings.googleDrive.rootFolderId,
                });
                if (driveFile) {
                    onPick(driveFile);
                } else {
                    onCancel?.();
                }
            } catch (e) {
                showError(e instanceof Error ? e.message : $t('settings.drive.error'));
                return;
            } finally {
                loadingUpload = false;
            }
        }
        fileInput.value = '';
    }

    const loading = $derived(loadingPicker || loadingUpload);
</script>

<button
    class="clear gdrive-btn"
    class:loading={loadingPicker}
    disabled={disabled || loading}
    onclick={openPicker}
    type="button"
>
    <span class="gdrive-icon">
        {#if loadingPicker}
            <span class="spinner"></span>
        {:else}
            <img src="icons/google-drive.svg" alt="Google Drive" />
        {/if}
    </span>
    <span class="gdrive-label">
        {loadingPicker ? $t('settings.drive.loading') : $t('songs.resource.select-cloud')}
    </span>
</button>

<input bind:this={fileInput} type="file" class="clear" accept={uploadMimeTypes} onchange={handleFileSelected} />

<button
    class="clear gdrive-btn upload-btn"
    class:loading={loadingUpload}
    disabled={disabled || loading}
    onclick={handleFileSelected}
    type="button"
>
    <span class="gdrive-icon">
        {#if loadingUpload}
            <span class="spinner"></span>
        {:else}
            <svg
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <polyline points="16 16 12 12 8 16" />
                <line x1="12" y1="12" x2="12" y2="21" />
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            </svg>
        {/if}
    </span>
</button>

<style>
    .gdrive-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.625rem;
        padding: 0.5rem 1rem;
        white-space: nowrap;
    }

    .gdrive-icon {
        display: flex;
        align-items: center;
        width: 20px;
        height: 20px;
        flex-shrink: 0;
    }

    .gdrive-icon svg {
        width: 20px;
        height: 20px;
    }
</style>
