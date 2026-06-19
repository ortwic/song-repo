<script lang="ts">
    import { t } from 'svelte-i18n';
    import { getContext } from 'svelte';
    import { cubicOut } from 'svelte/easing';
    import { slide } from 'svelte/transition';
    import { DialogKeys, type Dialog } from '../../model/dialog.model';
    import type { TrainingFocus, SessionKind, TrainingAreas } from '../../model/types';
    import type { Intensity, UserSession } from '../../model/session.model';
    import type { Song, UserSong } from '../../model/song.model';
    import { FOCUS_KEYS, SESSIONKIND_KEYS } from '../../model/types';
    import { createDeferred, type DeferredResult } from '../../utils/promise.helper';
    import { SEARCH_ACTIONS } from '../../domain/song.actions';
    import { process } from '../../domain/song.logic';
    import PopupMenu from '../ui/PopupMenu.svelte';
    import ConfirmDialog from './ConfirmDialog.svelte';
    import Expand from '../ui/elements/Expand.svelte';
    import TagEditor from '../ui/elements/TagEditor.svelte';
    import ProgressBar from '../ui/elements/ProgressBar.svelte';

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
    let song = $state<UserSong | null>(null);
    let session = $state({} as UserSession);
    let selectedKind = $state<SessionKind>('practice');
    let activeFocus = $state<Map<TrainingFocus, Intensity>>(new Map());
    let elapsedSeconds = $state(0);
    let intervalId: ReturnType<typeof setInterval>;

    let kindPopupMenu = $state<PopupMenu>();
    let searchPopupMenu = $state<PopupMenu>();
    let addFocusPopupMenu = $state<PopupMenu>();
    let sessionResult: DeferredResult<UserSession> = null;

    const slideParams = { duration: 200, easing: cubicOut };
    const resourceDialog = getContext<Dialog<Song>>(DialogKeys.resourceViewer);

    const isImportMode = $derived(selectedKind === 'import');
    const availableFocusKeys = $derived(FOCUS_KEYS.filter((key) => !activeFocus.has(key)));
    const previewProgress = $derived.by(() => {
        if (song) {
            const mergedMastery = { ...song.mastery };
            for (const [key, value] of activeFocus) {
                mergedMastery[key] = isImportMode
                    ? value
                    : (mergedMastery[key] ?? 0) + value;
            }
            return process({ ...song, mastery: mergedMastery }).progressFromMastery();
        }
    });

    export function showDialog(targetSong: UserSong): Promise<UserSession> {
        song = targetSong;
        session.songId = targetSong.id;
        session.title = targetSong.title;
        session.tags = targetSong.tags ?? [];
        session.notes = targetSong.notes ?? '';
        elapsedSeconds = 0;
        
        const manualProgressMode = targetSong.progress && !Object.keys(targetSong.mastery ?? {}).length;
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
        const suggested = process(song).suggestInitialFocus();
        activeFocus = new Map(suggested.map((key) => [key, INIT_FOCUS_VALUE]));
    }

    function initFocusFromProgress(): void {
        const mastery = process(song).masteryFromProgress();
        activeFocus = new Map(
            (Object.entries(mastery) as [TrainingFocus, number][]).map(([key, value]) => [key, value])
        );
    }

    function updateFocusFromProgress(progress: number): void {
        // bind:value updates progress one cycle late
        song.progress = progress;
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
            song.mastery[key] = 0;
            song.progress = previewProgress;
        }
    }

    function sumFocusValue(key: TrainingFocus, value: Intensity) {
        if (!isImportMode && song.mastery && song.mastery[key]) {
            return Math.ceil(song.mastery[key] + value);
        }
        return Math.ceil(value);
    }

    function setFocusValue(key: TrainingFocus, value: Intensity): void {
        activeFocus = new Map(activeFocus).set(key, value);
        if (isImportMode) {
            song.progress = previewProgress;
        }
    }

    function done(confirmed: boolean): void {
        clearInterval(+intervalId);
        if (!confirmed || !song) {
            sessionResult?.resolve(null);
        } else {
            session.type = selectedKind;
            session.areas = activeFocus.size > 0 ? Object.fromEntries(activeFocus) : undefined;

            if (isImportMode) {
                session.progress = song.progress;
            } else {
                session.durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
            }

            sessionResult?.resolve(session);
        }
        visible = false;
    }
</script>

<ConfirmDialog {visible} size="auto" onClose={done}>
    {#snippet header()}
        <span class="no-wrap">
            <i class="bx bx-play-circle"></i>
            {#if !isImportMode}
                <span>{formatElapsed(elapsedSeconds)}</span> –
            {/if}
            {song?.title ?? $t('sessions.dialog.title')}
            <span>({previewProgress ?? song.progress ?? 0}%)</span>
        </span>
    {/snippet}

    <div class="dialog-body">
        <div class="session-header header-actions">
            <button class="clear" title={$t('songs.menu.search')}
                onclick={(e) => searchPopupMenu?.showPopupMenu(e)}>
                <i class="item bx bx-search"></i>
            </button>
            {#if song?.uri}
                <button class="clear" title={$t('songs.resource.show')}
                    onclick={() => resourceDialog.open(song)}>
                    <i class="item bx bx-file"></i>
                </button>
            {/if}
            <!-- svelte-ignore a11y_missing_attribute -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <a role="button" class="label clear sm" title={$t(`sessions.kind.${selectedKind}`)} tabindex="0"
                onclick={(e) => kindPopupMenu?.showPopupMenu(e)}>
                <i class="item bx {SESSION_KIND_ICON[selectedKind]}"></i>
                {$t(`sessions.kind.${selectedKind}`)}
            </a>
            <span class="max-width right">
                <button class="clear" title={$t('settings.add')}
                    disabled={!availableFocusKeys.length}
                    onclick={(e) => addFocusPopupMenu?.showPopupMenu(e)}>
                    <i class="item bx bx-plus"></i>
                    {$t('sessions.menu.focus')}
                </button>
            </span>
        </div>

        <div class="import-progress">
            {#if isImportMode}
            <label for="progress">
                {$t('sessions.target-progress')}
            </label>
            <ProgressBar bind:value={song.progress} onChange={updateFocusFromProgress} />
            {:else}
            <label for="progress">
                {$t('songs.columns.progress')}
            </label>
            <ProgressBar value={previewProgress} disabled={true} />
            {/if}
        </div>

        <Expand title={$t('sessions.focus.label')}>
            <div class="focus-list">
                {#each activeFocus as [key, value]}
                    <span class="no-wrap" in:slide={slideParams} out:slide={slideParams}>
                        <i class="item bx {FOCUS_AREA_ICON[key]}"></i>
                        {$t(`sessions.focus.${key}`)}
                    </span>
                    <input in:slide={slideParams} out:slide={slideParams}
                        title="{sumFocusValue(key, value)}/{process(song).getFocusTarget(key)}"
                        type="range"
                        min={MIN_FOCUS_VALUE}
                        max={isImportMode
                            ? process(song).getFocusTarget(key)
                            : MAX_FOCUS_VALUE}
                        value={value}
                        oninput={(e) => setFocusValue(key, Number(e.currentTarget.value))}
                    />
                    <span class="no-wrap" in:slide={slideParams} out:slide={slideParams}>
                        {sumFocusValue(key, value)}
                    </span>
                    <button in:slide={slideParams} out:slide={slideParams}
                        class="clear" title={$t('settings.remove')}
                        onclick={() => removeFocus(key)}>
                        <i class="item bx bx-x"></i>
                    </button>
                {/each}
            </div>
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
</ConfirmDialog>

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
        <button class="option" onclick={() => song && window.open(action.url(song), '_blank')}>
            <i class="bx {action.icon}"></i>
            {action.label}
        </button>
    {/each}
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

    .focus-list {
        display: grid;
        grid-template-columns: 1fr 2fr 1.4rem 1.4rem;
        gap: 8px;
        padding: .4rem 0;
    }

    textarea {
        width: 100%;
        box-sizing: border-box;
        resize: vertical;
    }

    button.clear {
        padding: .1rem;
    }

    i.bx.bx-group-alt {
        background-color: currentColor;
        width: 1em;
        height: 1em;
        -webkit-mask: url('/icons/bx-group-alt.svg') center/contain no-repeat;
        mask: url('/icons/bx-group-alt.svg') center/contain no-repeat;
    }
</style>