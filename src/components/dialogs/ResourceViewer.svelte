<script lang="ts">
    import { t } from 'svelte-i18n';
    import { onMount } from 'svelte';
    import { setSessionError } from '../../domain/error-handler';
    import { createResourceResolver } from '../../domain/resource-resolver';
    import type { Song } from '../../model/song.model';
    import { registerDialog } from '../dialog-context.svelte';
    import DialogBase from './DialogBase.svelte';
    import { zoomable } from './zoomable';

    const resolver = createResourceResolver();

    let visible = $state(false);
    let uri = $state('');
    let title = $state('');
    let isBlocked = $state(false);
    let isIframeLoading = $state(false);
    let zoom = $state(1);
    let isZoomed = $derived(zoom !== 1);
    let likelyClosedIntentionally = $derived(!visible);

    let resolved = $derived(resolver.resolve(uri));

    $effect(() => {
        // Track embedUrl so the spinner re-appears each time the loaded resource changes.
        resolved.embedUrl;
        isIframeLoading = resolved.embedType === 'iframe';
    });

    onMount(() => {
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        }
    });

    registerDialog('ResourceViewer', showDialog);

    export function showDialog(song: Song): Promise<void> {
        uri = song.uri;
        title = `${song.artist} ${song.title}`;
        isBlocked = false;
        isZoomed = false;
        visible = true;
        return Promise.resolve();
    }

    function handleIframeLoad(): void {
        isIframeLoading = false;
    }

    function handleError(err: unknown): void {
        isBlocked = true;
        isIframeLoading = false;
        console.log(err);
    }

    function handleBeforeUnload(): void {
        if (resolved.embedType === 'iframe' && !likelyClosedIntentionally) {
            // Reload could be triggered intentionally or unexpectedly by some extension like ublock origin
            const title = $t('warnings.extension-interrupt.title');
            const message = '<i class="bx bx-extension"></i> ' + $t('warnings.extension-interrupt.body');
            setSessionError({
                title,
                body: message,
                error: new Error(message, { cause: resolved.providerId })
            });
        }
    }

    function openExternal(): void {
        window.open(uri, '_blank');
    }

    function close(): void {
        visible = false;
    }
</script>

<DialogBase {visible} size="full" onClose={close}>
    {#snippet header()}
        <i class="bx bx-file"></i>
        <a href={uri} target="_blank">{uri}</a>
        {#if resolved.embedType === 'image'}
        ({(zoom * 100).toFixed()}%)
        {/if}
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
    {:else if resolved.embedType === 'image'}
        <div class="image-viewer" class:zoomed={isZoomed}>
            <img
                src={resolved.embedUrl}
                alt={title}
                use:zoomable={{ 
                    minScale: 0.5,
                    maxScale: 4,
                    onChange: (state) => (zoom = state.scale) 
                }}
                onerror={() => handleError('image load failed')}
            />
        </div>
    {:else if resolved.embedType === 'iframe'}
    <div class="iframe-container">
        {#if isIframeLoading}
            <div class="iframe-loading-overlay">
                <span class="spinner"></span>
            </div>
        {/if}
        {#key resolved.embedUrl}
            <iframe
                src={resolved.embedUrl}
                {title}
                onload={handleIframeLoad}
                onerror={handleError}
                allow={resolved.iframeAttributes?.allow}
                referrerpolicy={resolved.iframeAttributes?.referrerpolicy}
                sandbox={resolved.iframeAttributes?.sandbox}
                allowfullscreen
            ></iframe>
        {/key}
    </div>
    {:else}
        <object {title} data={resolved.embedUrl}></object>
    {/if}
</DialogBase>

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
    .iframe-container {
        position: relative;
        width: 100%;
        flex: 1;
        display: flex;
    }
    .iframe-loading-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1;
    }
    iframe {
        width: 100%;
        flex: 1;
        border: none;
    }
    .image-viewer {
        width: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        display: flex;
        justify-content: center;
        align-items: flex-start;

        img {
            width: 100%;
            height: auto;
            display: block;
            cursor: zoom-in;
            touch-action: pan-y;
            transform-origin: top center;
            will-change: transform;
        }

        &.zoomed {
            overflow: hidden;

            img {
                cursor: grab;
                touch-action: none;
            }
        }
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