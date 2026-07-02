<script lang="ts">
    import { t } from 'svelte-i18n';
    import { cubicOut } from 'svelte/easing';
    import { slide } from 'svelte/transition';
    import { Timestamp } from 'firebase/firestore';
    import { createMetronome, type Metronome } from '@dougflip/metronome';
    import { SEARCH_ACTIONS } from '../../domain/song.actions';
    import type { SongEntity } from '../../domain/song.entity';
    import type { TrainingFocus, SessionKind, TrainingAreas } from '../../model/types';
    import type { Intensity, UserSession } from '../../model/session.model';
    import type { Song } from '../../model/song.model';
    import { FOCUS_KEYS, SESSIONKIND_KEYS } from '../../model/types';
    import { createDeferred, type DeferredResult } from '../../utils/promise.helper';
    import { normalizeSignature } from '../../utils/metronome/tonal-params';
    import { openDialog, registerDialog } from '../dialog-context.svelte';
    import PopupMenu from '../ui/PopupMenu.svelte';
    import Expand from '../ui/elements/Expand.svelte';
    import MetronomeElement from '../ui/elements/Metronome.svelte';
    import TagEditor from '../ui/elements/TagEditor.svelte';
    import ProgressBar from '../ui/elements/ProgressBar.svelte';
    import DialogBase from './DialogBase.svelte';

    const MAX_FOCUS_VALUE = 5;
    const MIN_FOCUS_VALUE = 0;
    const INIT_FOCUS_VALUE = 0;
    const SESSION_KIND_ICON: Record<SessionKind, string> = {
        practice: 'bx-dumbbell',
        jam: 'bx-music',
        demo: 'bx-station',
        record: 'bx-microphone',
        import: 'bx-check-circle',
    };
    const FOCUS_AREA_ICON: TrainingAreas<string> = {
        melody: 'bx-music',
        harmony: 'bx-group-alt',
        rhythm: 'bx-timer',
        technique: 'bx-wrench',
        expression: 'bx-palette',
        form: 'bx-grid-alt',
        finishing: 'bx-flag',
        improv: 'bx-trophy',
        memorize: 'bx-brain',
    };

    let visible = $state(false);
    let songEntity = $state<SongEntity | null>(null);
    let session = $state({} as UserSession);
    let selectedKind = $state<SessionKind>('practice');
    let activeFocus = $state<Map<TrainingFocus, Intensity>>(new Map());
    let elapsedSeconds = $state(0);
    let intervalId: ReturnType<typeof setInterval>;
    let metronome: Metronome = $state();
    let minTempo = $state(40);
    let maxTempo = $state(256);

    let kindPopupMenu = $state<PopupMenu>();
    let searchPopupMenu = $state<PopupMenu>();
    let metronomePopupMenu = $state<PopupMenu>();
    let addFocusPopupMenu = $state<PopupMenu>();
    let sessionResult: DeferredResult<UserSession> = null;

    const slideParams = { duration: 200, easing: cubicOut };

    const isImportMode = $derived(selectedKind === 'import');
    const availableFocusKeys = $derived(FOCUS_KEYS.filter((key) => !activeFocus.has(key)));
    const previewProgress = $derived.by(() => {
        if (songEntity) {
            const mergedMastery = { ...songEntity.mastery };
            for (const [key, value] of activeFocus) {
                mergedMastery[key] = isImportMode
                    ? value
                    : (mergedMastery[key] ?? 0) + value;
            }
            return songEntity.progressFromMastery(mergedMastery);
        }
    });
    const delta = $derived(songEntity.retentionDelta({
        changedAt: Timestamp.now(),
        touchCount: (songEntity.touchCount ?? 0) + 1,
        lastRetention: songEntity.retentionFactor(songEntity.changedAt, songEntity.touchCount)
    }));

    registerDialog('SessionDialog', showDialog);

    export function showDialog(model: SongEntity): Promise<UserSession> {
        songEntity = model;
        session.songId = model.id;
        session.title = model.title;
        session.touchCount = model.touchCount;
        session.tags = model.tags ?? [];
        session.notes = model.notes ?? '';
        elapsedSeconds = 0;

        const { tempo, beatsPerBar } = normalizeSignature(songEntity.bpm, songEntity.time);
        maxTempo = tempo;
        minTempo = Math.floor(tempo * 0.6);
        metronome = createMetronome({
            tempo,
            beatsPerBar,
            volume: 50,
        });

        const manualProgressMode = model.progress && !Object.keys(model.mastery ?? {}).length;
        setSessionKind(manualProgressMode ? 'import' : 'practice');

        visible = true;
        intervalId = setInterval(() => elapsedSeconds++, 1000);
        sessionResult = createDeferred<UserSession>();
        return sessionResult.promise;
    }

    function setSessionKind(newValue: SessionKind, oldValue?: SessionKind) {
        if (newValue === 'import') {
            initFocusFromProgress();
        } else if (!oldValue || oldValue === 'import') {
            initFocusFromSuggestion();
        }
        selectedKind = newValue;
    }

    function initFocusFromSuggestion(): void {
        const suggested = songEntity.suggestInitialFocus();
        activeFocus = new Map(suggested.map((key) => [key, INIT_FOCUS_VALUE]));
    }

    function initFocusFromProgress(): void {
        const mastery = songEntity.masteryFromProgress();
        activeFocus = new Map(
            (Object.entries(mastery) as [TrainingFocus, number][]).map(([key, value]) => [key, value])
        );
    }

    function updateFocusFromProgress(progress: number): void {
        // bind:value updates progress one cycle late
        songEntity.progress = progress;
        initFocusFromProgress();
    }

    function formatElapsed(seconds: number): string {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function addFocus(key: TrainingFocus): void {
        activeFocus = new Map(activeFocus).set(key, INIT_FOCUS_VALUE);
    }

    function removeFocus(key: TrainingFocus): void {
        const next = new Map(activeFocus);
        next.delete(key);
        activeFocus = next;
        if (isImportMode) {
            songEntity.mastery[key] = 0;
            songEntity.progress = previewProgress;
        }
    }

    function sumFocusValue(key: TrainingFocus, value: Intensity) {
        if (!isImportMode && songEntity.mastery && songEntity.mastery[key]) {
            return Math.ceil(songEntity.mastery[key] + value);
        }
        return Math.ceil(value);
    }

    function setFocusValue(key: TrainingFocus, value: Intensity): void {
        activeFocus = new Map(activeFocus).set(key, value);
        if (isImportMode) {
            songEntity.progress = previewProgress;
        }
    }

    function startMetronome(e: MouseEvent): void {
        metronome.start();
        metronomePopupMenu?.showPopupMenu(e);
    }

    function done(confirmed: boolean): void {
        clearInterval(+intervalId);
        metronome.stop();

        if (!confirmed || !songEntity) {
            sessionResult?.resolve(null);
        } else {
            session.type = selectedKind;
            session.areas = activeFocus.size > 0 ? Object.fromEntries(activeFocus) : undefined;

            if (isImportMode) {
                session.progress = songEntity.progress;
            } else {
                session.durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
            }

            sessionResult?.resolve(session);
        }
        visible = false;
    }
</script>

<DialogBase {visible} size="auto" onClose={done}>
    {#snippet header()}
        <span class="no-wrap">
            <i class="bx bx-play-circle"></i>
            {#if !isImportMode}
                <span>{formatElapsed(elapsedSeconds)}</span> –
            {/if}
            {songEntity?.title ?? $t('sessions.dialog.title')}
        </span>
    {/snippet}

    <div class="dialog-body">
        <div class="session-header header-actions">
            <button class="clear" title={$t('songs.menu.search')}
                onclick={(e) => searchPopupMenu?.showPopupMenu(e)}>
                <i class="item bx bx-search"></i>
            </button>
            {#if songEntity?.uri}
                <button class="clear" title={$t('songs.resource.show')}
                    onclick={() => openDialog<Song>('ResourceViewer', songEntity)}>
                    <i class="item bx bx-file"></i>
                </button>
            {/if}
            <button title={$t('sessions.menu.metronome')} class="clear" 
                onclick={startMetronome}>
                <i class="item bx metronome"></i>
            </button>
            <span class="no-wrap" style="padding: 0 1rem" title={$t('sessions.total-runs')}>
                <label for="touchCount">{$t('songs.columns.touchCount')}</label>
                <input class="input" type="number" min="1" disabled={!isImportMode} bind:value={session.touchCount} />
                <i class="item bx bx-info-circle" title={$t('sessions.total-runs-info')}
                    class:primary={isImportMode}>
                </i>
            </span>
            <span class="max-width right">
                <!-- svelte-ignore a11y_missing_attribute -->
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <a role="button" class="label clear sm" title={$t(`sessions.kind.${selectedKind}`)} tabindex="0"
                    onclick={(e) => kindPopupMenu?.showPopupMenu(e)}>
                    <i class="item bx {SESSION_KIND_ICON[selectedKind]}"></i>
                    {$t(`sessions.kind.${selectedKind}`)}
                </a>
            </span>
        </div>

        <div class="import-progress">
            {#if isImportMode}
            <label for="progress">
                {$t('sessions.target-progress')}
            </label>
            <ProgressBar 
                bind:value={songEntity.progress} 
                delta={delta} 
                onChange={updateFocusFromProgress} 
            />
            {:else}
            <label for="progress">
                {$t('songs.columns.progress')}
            </label>
            <ProgressBar 
                initialValue={songEntity.progress} 
                initialDelta={songEntity.retentionDelta()}
                value={previewProgress} 
                animationDurationMs={1000}
                delta={delta} 
                disabled={true} 
            />
            {/if}
        </div>

        <Expand title={$t('songs.columns.mastery')}>
            <div class="focus-list">
                {#each activeFocus as [key, value]}
                    <span class="no-wrap" in:slide={slideParams} out:slide={slideParams}>
                        <i class="item bx {FOCUS_AREA_ICON[key]}"></i>
                        {$t(`sessions.focus.${key}`)}
                    </span>
                    <span class="range" in:slide={slideParams} out:slide={slideParams}>
                        <input
                            title="{sumFocusValue(key, value)}/{songEntity.getFocusTarget(key)}"
                            type="range"
                            min={MIN_FOCUS_VALUE}
                            max={isImportMode
                                ? songEntity.getFocusTarget(key)
                                : MAX_FOCUS_VALUE}
                            value={value}
                            oninput={(e) => setFocusValue(key, Number(e.currentTarget.value))}
                        />
                        <span class="no-wrap">
                            {sumFocusValue(key, value)}
                        </span>
                    </span>
                    <button in:slide={slideParams} out:slide={slideParams}
                        class="clear" title={$t('settings.remove')}
                        onclick={() => removeFocus(key)}>
                        <i class="item bx bx-x"></i>
                    </button>
                {/each}
            </div>
            <button class="clear" title={$t('settings.add')}
                disabled={!availableFocusKeys.length}
                onclick={(e) => addFocusPopupMenu?.showPopupMenu(e)}>
                <i class="item bx bx-plus-circle"></i>
                {$t('sessions.menu.focus')}
            </button>
        </Expand>

        <Expand title={$t('sessions.notes.label')}>
            <TagEditor bind:labels={session.tags} />

            <textarea
                placeholder={$t('sessions.notes.placeholder')}
                rows="4"
                bind:value={session.notes}
            ></textarea>
        </Expand>
    </div>
</DialogBase>

<PopupMenu bind:this={kindPopupMenu}>
    {#each SESSIONKIND_KEYS as kind}
        <button class="option" class:active={selectedKind === kind}
            onclick={() => setSessionKind(kind, selectedKind)}>
            <i class="bx {SESSION_KIND_ICON[kind]}"></i>
            {$t(`sessions.kind.${kind}`)}
        </button>
    {/each}
</PopupMenu>

<PopupMenu bind:this={searchPopupMenu}>
    {#each SEARCH_ACTIONS as action}
        <button class="option" onclick={() => songEntity && window.open(action.url(songEntity), '_blank')}>
            <i class="bx {action.icon}"></i>
            {action.label}
        </button>
    {/each}
</PopupMenu>

<PopupMenu bind:this={metronomePopupMenu}>
    <MetronomeElement {metronome} min={minTempo} max={maxTempo} />
</PopupMenu>

<PopupMenu bind:this={addFocusPopupMenu}>
    {#each availableFocusKeys as key}
        <button class="option" onclick={() => addFocus(key)}>
            <i class="item bx {FOCUS_AREA_ICON[key]}"></i>
            {$t(`sessions.focus.${key}`)}
        </button>
    {/each}
</PopupMenu>

<style lang="scss">
    .session-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        width: 100%;

        .max-width {
            flex: 1;
        }
    }

    .header-actions {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
    }

    .dialog-body {
        gap: 1rem;
        overflow-x: hidden;
    }

    input[type="number"] {
        margin: 0 0.4rem;
        width: 4rem;
        text-align: right;
        border-width: 0 0 1px 0;
        background-color: transparent;

        &:disabled {
            color: var(--text-muted);
        }
    }

    .focus-list {
        display: grid;
        grid-template-columns: 1fr 2fr 1.4rem;
        gap: .4rem;
        padding: .4rem 0;

        .range {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: .4rem;
        }
    }

    textarea {
        width: 100%;
        box-sizing: border-box;
        resize: vertical;
    }

    button.clear {
        padding: .1rem;
    }
</style>