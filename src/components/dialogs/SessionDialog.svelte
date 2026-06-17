<script lang="ts">
    import { t } from 'svelte-i18n';
    import { getContext } from 'svelte';
    import { DialogKeys, type Dialog } from '../../model/dialog.model';
    import type { TrainingFocus, SessionKind, TrainingAreas } from '../../model/types';
    import type { Intensity, UserSession } from '../../model/session.model';
    import type { Song, UserSong } from '../../model/song.model';
    import { FOCUS_KEYS, SESSIONKIND_KEYS } from '../../model/types';
    import { createDeferred, type DeferredResult } from '../../utils/promise.helper';
    import { SEARCH_ACTIONS } from '../../domain/song.actions';
    import { process } from '../../domain/song.logic';
    import Expand from '../ui/elements/Expand.svelte';
    import PopupMenu from '../ui/PopupMenu.svelte';
    import ConfirmDialog from './ConfirmDialog.svelte';
    import TagEditor from '../ui/elements/TagEditor.svelte';

    const MAX_FOCUS_VALUE = 5;
    const MIN_FOCUS_VALUE = 0;
    const INIT_FOCUS_VALUE = 0;
    const SESSION_KIND_ICON = {
        practice: 'bx-dumbbell',
        jam: 'bx-music',
        demo: 'bx-station',
        record: 'bx-microphone',
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

    let song = $state<UserSong | null>(null);
    let visible = $state(false);
    let selectedKind = $state<SessionKind>('practice');
    let activeFocus = $state<Map<TrainingFocus, Intensity>>(new Map());
    let tags = $state<string[]>([]);
    let notes = $state('');
    let elapsedSeconds = $state(0);
    let intervalId: ReturnType<typeof setInterval>;

    let kindPopupMenu = $state<PopupMenu>();
    let searchPopupMenu = $state<PopupMenu>();
    let addFocusPopupMenu = $state<PopupMenu>();

    let sessionResult: DeferredResult<UserSession> = null;

    const resourceDialog = getContext<Dialog<Song>>(DialogKeys.resourceViewer);
    const formattedTime = $derived(formatElapsed(elapsedSeconds));
    const durationMinutes = $derived(Math.max(1, Math.round(elapsedSeconds / 60)));
    const availableFocusKeys = $derived(FOCUS_KEYS.filter((key) => !activeFocus.has(key)));
    const previewProgress = $derived.by(() => {
        if (song) {
            const mergedMastery = { ...song.mastery };
            for (const [key, value] of activeFocus) {
                mergedMastery[key] = (mergedMastery[key] ?? 0) + value;
            }
            return process({ ...song, mastery: mergedMastery }).progressFromMastery();
        }
    });

    export function showDialog(targetSong: UserSong): Promise<UserSession> {
        song = targetSong;
        tags = targetSong.tags ?? [];
        notes = targetSong.notes ?? '';
        selectedKind = 'practice';
        elapsedSeconds = 0;

        const suggested = process(targetSong).suggestInitialFocus();
        activeFocus = new Map(suggested.map((key) => [key, INIT_FOCUS_VALUE]));

        visible = true;
        intervalId = setInterval(() => elapsedSeconds++, 1000);
        sessionResult = createDeferred<UserSession>();
        return sessionResult.promise;
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
    }

    function sumFocusValue(key: TrainingFocus, value: Intensity) {
        if (song.mastery && song.mastery[key]) {
            return song.mastery[key] + value;
        }
        return value;
    }

    function setFocusValue(key: TrainingFocus, value: Intensity): void {
        activeFocus = new Map(activeFocus).set(key, value);
    }

    function done(confirmed: boolean): void {
        clearInterval(+intervalId);
        if (!confirmed || !song) {
            sessionResult?.resolve(null);
        } else {
            const areas: UserSession['areas'] = activeFocus.size > 0
                ? Object.fromEntries(activeFocus)
                : undefined;

            sessionResult?.resolve({
                type: selectedKind,
                songId: song.id,
                title: song.title,
                areas,
                tags,
                durationMinutes,
                notes: notes.trim() || '',
            } as UserSession);
        }
        visible = false;
    }
</script>

<ConfirmDialog {visible} size="auto" onClose={done}>
    {#snippet header()}
        <span class="no-wrap">
            <i class="bx bx-play-circle"></i>
            <span>{formattedTime}</span> – {song?.title ?? $t('sessions.dialog.title')}
            <span>({previewProgress ?? song.progressResult ?? 0}%)</span>
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

        <Expand title={$t('sessions.focus.label')}>
            <div class="focus-list">
                {#each activeFocus as [key, value]}
                    <span class="no-wrap">
                        <i class="item bx {FOCUS_AREA_ICON[key]}"></i>
                        {$t(`sessions.focus.${key}`)}
                    </span>
                    <input
                        title="{sumFocusValue(key, value)}/{process(song).getFocusTarget(key)}"
                        type="range"
                        min={MIN_FOCUS_VALUE}
                        max={MAX_FOCUS_VALUE}
                        value={value}
                        oninput={(e) => setFocusValue(key, Number(e.currentTarget.value))}
                    />
                    <span class="no-wrap">{sumFocusValue(key, value)}</span>
                    <button class="clear" title={$t('settings.remove')}
                        onclick={() => removeFocus(key)}>
                        <i class="item bx bx-x"></i>
                    </button>
                {/each}
            </div>
        </Expand>

        <Expand title={$t('sessions.notes.label')}>
            <TagEditor bind:labels={tags} />

            <textarea
                placeholder={$t('sessions.notes.placeholder')}
                rows="4"
                bind:value={notes}
            ></textarea>
        </Expand>
    </div>
</ConfirmDialog>

<PopupMenu bind:this={kindPopupMenu}>
    {#each SESSIONKIND_KEYS as kind}
        <button class="option" class:active={selectedKind === kind}
            onclick={() => (selectedKind = kind)}>
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
        grid-template-columns: auto 1fr 1rem auto;
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