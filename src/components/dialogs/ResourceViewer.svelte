<script lang="ts">
    import { t } from 'svelte-i18n';
    import { zoomable } from '../actions/zoomable.action';
    import { registerDialog } from '../dialog-context.svelte';
    import { createResourceResolver } from '../../domain/resource-resolver';
    import type { Song } from '../../model/song.model';
    import { currentUser } from '../../service/user/auth.service';
    import IFrame from '../ui/elements/IFrame.svelte';
    import DialogBase from './DialogBase.svelte';

    const resolver = createResourceResolver();

    let visible = $state(false);
    let uri = $state('');
    let title = $state('');
    let isBlocked = $state(false);
    let zoom = $state(1);
    let consent = $derived(Boolean($currentUser));
    let isZoomed = $derived(zoom !== 1);

    let resolved = $derived(resolver.resolve(uri));

    registerDialog('ResourceViewer', showDialog);

    export function showDialog(song: Song): Promise<void> {
        uri = song.uri;
        title = `${song.artist} ${song.title}`;
        isBlocked = false;
        isZoomed = false;
        visible = true;
        return Promise.resolve();
    }

    function handleError(err: unknown): void {
        isBlocked = true;
        console.warn(err);
    }

    function openExternal(): void {
        window.open(uri, '_blank');
    }

    function close(): void {
        visible = false;
    }
</script>

<DialogBase {visible} size="full" type="view" onClose={close}>
    {#snippet header()}
        <i class="bx bx-file"></i>
        <a href={uri} target="_blank">{uri}</a>
        {#if resolved.embedType === 'image'}
        ({(zoom * 100).toFixed()}%)
        {/if}
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
        <IFrame
            src={resolved.embedUrl}
            {title}
            {consent}
            allow={resolved.iframeAttributes?.allow}
            referrerpolicy={resolved.iframeAttributes?.referrerpolicy}
            sandbox={resolved.iframeAttributes?.sandbox}
            onError={handleError}
        />
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