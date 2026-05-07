<script lang="ts">
    import { t } from 'svelte-i18n';
    import type { DriveFile } from '../../model/file.model';
    import { googleDriveService } from '../../service/storage/google-drive.service';
    import { showError } from '../../store/notification.store';

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
                const driveFile = await googleDriveService.uploadFile(file);
                if (driveFile) {
                    onPick(driveFile);
                } else {
                    onCancel?.();
                }
            } catch (e) {
                showError(e instanceof Error ? e.message : $t('songs.resource.drive-error'));
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
            <!-- Google Drive icon (inline SVG, no external dependency) -->
            <svg viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path
                    d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z"
                    fill="#0066da"
                />
                <path
                    d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z"
                    fill="#00ac47"
                />
                <path
                    d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z"
                    fill="#ea4335"
                />
                <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
                <path
                    d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z"
                    fill="#2684fc"
                />
                <path
                    d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z"
                    fill="#ffba00"
                />
            </svg>
        {/if}
    </span>
    <span class="gdrive-label">
        {loadingPicker ? $t('songs.resource.drive-loading') : $t('songs.resource.select-cloud')}
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
