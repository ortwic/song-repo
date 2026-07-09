<script lang="ts">
    import { t } from 'svelte-i18n';
    import { onDestroy } from 'svelte';
    import { push } from 'svelte-spa-router';
    import type { SnippetType, UserSnippet } from '../../model/snippet.model';
    import { type DialogAction, registerDialog, type WizardDialogArgs } from '../dialog-context.svelte';
    import { createDeferred, type DeferredResult } from '../../utils/promise.helper';
    import { StorageService } from '../../service/base/storage.service';
    import { lang } from '../../service/base/i18n.setup';
    import { toDate } from '../../utils/date.helper';
    import NotFound from '../../routes/NotFound.svelte';
    import ScorePreview from '../ui/ScorePreview.svelte';
    import MidiPlayer from '../ui/MidiPlayer.svelte';
    import { toClipboard } from '../ui/helper/input.helper';
    import Expand from '../ui/elements/Expand.svelte';
    import IFrame from '../ui/elements/IFrame.svelte';
    import DialogBase from './DialogBase.svelte';

    const EMPTY_SNIPPET = { groups: [], tags: [], difficulty: 3 } as UserSnippet;
    const DEFAULT_META_VALUE = '–';

    const SNIPPET_TYPE_ICON: Record<SnippetType, string> = {
        custom: 'bx-bookmark',

        // Learning and practice
        etude: 'bx-book-open',

        // Musical ideas and phrases
        motif: 'bx-shape-circle',
        phrase: 'bx-message-rounded-detail',

        // Characteristic short ideas
        riff: 'bx-repeat',
        lick: 'bx-repeat',

        // Rhythmic material
        groove: 'bx-pulse',
        pattern: 'bx-grid-alt',

        // Structural elements
        fill: 'bx-transfer-alt',
        progression: 'bx-git-branch',
        cadence: 'bx-check-double',
    };

    const storage = new StorageService();

    let visible = $state(false);
    let snippet = $state<UserSnippet | null>(null);

    let dialogResult: DeferredResult<void> = null;

    const shareLink = $derived(window.location.origin + `#/snippets/${snippet.id}`);
    const metaFields = $derived(
        snippet
            ? [
                  { label: $t('songs.columns.key'), value: snippet.key },
                  { label: $t('songs.columns.bpm'), value: snippet.bpm },
                  { label: $t('songs.columns.time'), value: snippet.time },
                  { label: $t('songs.columns.difficulty'), value: snippet.difficulty },
              ]
            : []
    );

    registerDialog('SnippetDialog', showDialog);

    export function showDialog(args: WizardDialogArgs<UserSnippet>): Promise<void> {
        snippet = { ...EMPTY_SNIPPET, ...args.model };
        visible = true;
        dialogResult = createDeferred<void>();

        return dialogResult.promise;
    }

    function handleClose(action?: DialogAction): void {
        visible = false;
        dialogResult?.resolve();
        push('/snippets');
    }

    function formatLastPlayed(): string {
        if (!snippet?.changedAt) {
            return $t('snippets.dialog.never-played');
        }
        return $t('snippets.dialog.last-played') + ' ' + toDate(snippet.changedAt).toRelative();
    }

    onDestroy(() => {
        dialogResult?.resolve();
    });
</script>

<DialogBase {visible} size="full" type="wizard" onClose={({ action }) => handleClose(action)}>
    {#snippet header()}
        <span class="no-wrap">
            <i class="bx {SNIPPET_TYPE_ICON[snippet?.type ?? 'custom']}"></i>
            {#if snippet?.id}
            {[snippet.artist, ...snippet.groups].join(' > ')}
            {:else}
            {$t('notfound.title')}
            {/if}
        </span>
    {/snippet}
    {#snippet controls()}
        <button class="titlebar-button" title="{$t('profile.share-link')}" onclick={() => toClipboard(shareLink)}>
            <i class="bx bx-share-alt"></i> 
        </button>
    {/snippet}
    {#if snippet?.id}
    <section class="body">
        <Expand title={$t('common.details', { values: { title: snippet?.title } })}>
            <div class="snippet-row">
                <i class="bx bx-time"></i>
                {formatLastPlayed()}
            </div>

            <div class="snippet-row">
                <i class="item bx bx-info-circle"></i>
                {#each metaFields as field}
                    <div class="no-wrap">
                        <label for="meta-{field.label}">{field.label}</label>
                        <span class="label">{field.value ? field.value : DEFAULT_META_VALUE}</span>
                    </div>
                {/each}
            </div>
            <div class="snippet-row">
                <i class="item bx bx-label"></i>
                {#each snippet.instruments as item}
                    <span class="label no-wrap">{item}</span>
                {/each}
                {#each snippet.tags as item}
                    <span class="label no-wrap">{item}</span>
                {/each}
            </div>
            <p class="snippet-row">
                {#if lang.startsWith('de')}
                    {@html snippet?.description_de}
                {:else}
                    {@html snippet?.description_en}
                {/if}
            </p>

            {#if snippet.uri}
                <IFrame src={snippet.uri} title={snippet.title} />
            {/if}
        </Expand>

        <Expand title={$t('common.score-preview.title', { values: { title: snippet?.title } })}>
            <p>
                {#await storage.getFileUrl(snippet.mxmlPath)}
                    <span class="spinner"></span>
                {:then url}
                <ScorePreview {url} />
                {/await}
            </p>
        </Expand>

        <Expand title={$t('common.midi-player.play-midi', { values: { title: snippet?.title } })}>
            <p>
                {#await storage.getFileUrl(snippet.midiPath)}
                    <span class="spinner"></span>
                {:then midiUrl}
                <MidiPlayer {midiUrl} />
                {/await}
            </p>
        </Expand>
    </section>
    {:else}
    <NotFound />
    {/if}
</DialogBase>

<style lang="scss">
    .body {
        padding: 1em;
    }

    .snippet-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 1rem;
        margin: 0.5rem 0;
    }
</style>