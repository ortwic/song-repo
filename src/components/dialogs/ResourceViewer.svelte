<script lang="ts">
    import { t } from 'svelte-i18n';
    import type { Song } from '../../model/song.model';
    import ConfirmDialog from './ConfirmDialog.svelte';

    const IFRAME_BLOCKED_EVENTS = ['securitypolicyviolation'] as const;

    let visible = $state(false);
    let uri = $state('');
    let title = $state('');
    let isBlocked = $state(false);

    export function showDialog(song: Song): Promise<void> {
        uri = song.uri;
        title = `${song.artist} ${song.title}`;
        isBlocked = false;
        visible = true;
        return Promise.resolve();
    }

    function useIframe() {
        return !uri?.endsWith('.svg');
    }

    function handleIframeError(err: unknown): void {
        isBlocked = true;
        console.log(err);
    }

    function openExternal(): void {
        window.open(uri, '_blank');
    }

    function close(): void {
        visible = false;
    }
</script>

<ConfirmDialog {visible} size="full" onClose={close}>
    {#snippet header()}
        <i class="bx bx-file"></i>
        <a href={uri} target="_blank">{uri}</a>
    {/snippet}
    {#snippet footer()}
        <!-- hide confirm/decline -->
    {/snippet}

    {#if isBlocked}
        <div class="viewer-body">
            <div class="center y-flex blocked-notice">
                <i class="bx bx-block larger"></i>
                <p>{$t('songs.resource.blocked')}</p>
                <button class="clear" onclick={openExternal}>
                    <i class="bx bx-link-external"></i>
                    {$t('songs.menu.open')}
                </button>
            </div>
        </div>
    {:else if (useIframe())}
        <iframe src={uri} {title} onerror={handleIframeError}></iframe>
    {:else}
        <object {title} data={uri}></object>
    {/if}
</ConfirmDialog>

<style lang="scss">
    .viewer-body {
        width: 100%;
        height: 70vh;
        display: flex;
        flex-direction: column;
    }

    a {
        overflow: hidden;
        text-overflow: ellipsis;
        color: inherit;

        &:hover {
            color: inherit;
            text-decoration: underline;
        }
    }

    iframe {
        width: 100%;
        flex: 1;
        border: none;
    }

    object {
        width: 100%;
        height: calc(100% - 2.2em);
        overflow-x: hidden;
        overflow-y: visible;
    }

    .blocked-notice {
        flex: 1;
        justify-content: center;
        align-items: center;
        gap: 1rem;
    }
</style>