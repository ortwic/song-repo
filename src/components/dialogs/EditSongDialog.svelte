<script lang="ts">
    import { t } from 'svelte-i18n';
    import Autocomplete from 'simple-svelte-autocomplete/src/SimpleAutocomplete.svelte';
    import '../../styles/overrides/simple-autocomplete.scss';
    import ConfirmDialog from './ConfirmDialog.svelte';
    import SelectKey from '../ui/SelectKey.svelte';
    import SongService from '../../service/user-song.service';
    import type { UserSong } from '../../model/song.model';
    import { createDeferred } from '../../utils/promise.helper';
    import Expand from '../ui/elements/Expand.svelte';
    import genres from '../../data/genres.json';
    import { redToGreenRange } from '../../styles/style.helper';

    const TIME_PRESETS = ['4/4', '3/4', '6/8', '2/4', '12/8', '5/4', '7/8', '2/2'];
    const songService = new SongService();
    let form: HTMLFormElement = $state();
    let visible = $state(false);
    let editSong: Partial<UserSong> = $state({ features: [], tags: [] });
    const isNew = $derived(editSong.id === undefined);
    const difficultyColor = $derived(redToGreenRange(100 - editSong.difficulty * 10));
    const styles = (genre: string) => (genres.find((v) => v.name === genre) ?? genres[0]).styles;
    let deferred: ReturnType<typeof createDeferred<UserSong>> | null = null;

    export function showDialog(initial?: Partial<UserSong>): Promise<UserSong> {
        deferred = createDeferred<UserSong>();
        editSong = { features: [], tags: [], ...initial };
        visible = true;
        return deferred.promise;
    }

    function done(confirmed: boolean): void {
        if (!confirmed) {
            deferred?.resolve(null);
            reset();
        } else if (form.checkValidity()) {
            deferred?.resolve(editSong as UserSong);
            reset();
        }
    }

    function reset(): void {
        editSong = { features: [], tags: [] };
        visible = false;
    }

    function addLabel(ev: KeyboardEvent, type: 'features' | 'tags'): void {
        const input = ev.target as HTMLInputElement;
        if (ev.key === ',') {
            ev.preventDefault();
            editSong[type] = [...editSong[type], input.value];
            input.value = '';
        }
    }
</script>

<form bind:this={form} onsubmit={(e) => e.preventDefault()}>
    <ConfirmDialog {visible} size="full" onClose={done}>
        {#snippet header()}
            <span>
                <i class="bx bx-music"></i>
                {isNew ? $t('songs.addTitle') : `${$t('songs.edit')} ${editSong.title}`}
            </span>
        {/snippet}

        <div class="dialog-body">
            <Expand open={isNew} title={$t('songs.sections.song-general')}>
                <div class="field-grid">
                    <div class="group">
                        <label for="title">{$t('songs.columns.title')} *</label>
                        <input id="title" type="text" bind:value={editSong.title} required placeholder="Title" />
                    </div>

                    <div class="group">
                        <label for="artist">{$t('songs.columns.artist')} *</label>
                        <input id="artist" type="text" bind:value={editSong.artist} required placeholder="Artist" />
                    </div>

                    <div class="group">
                        <label for="genre">{$t('songs.columns.genre')}</label>
                        <Autocomplete
                            inputClassName="lg"
                            labelFieldName="name"
                            placeholder="genre"
                            minCharactersToSearch={0}
                            items={genres}
                            showClear={true}
                            bind:text={editSong.genre}
                            hideArrow={true}
                        >
                            {#snippet item({ item, label })}
                                <div class="square" style:background-color={item.color}></div>
                                <span class="option">{@html label}</span>
                            {/snippet}
                        </Autocomplete>
                    </div>

                    <div class="group">
                        <label for="style">{$t('songs.columns.style')}</label>
                        <Autocomplete
                            inputClassName="lg"
                            placeholder="style"
                            hideArrow={true}
                            minCharactersToSearch={0}
                            searchFunction={() => styles(editSong.genre && editSong.genre[0])}
                            showClear={true}
                            bind:text={editSong.style}
                        >
                            {#snippet item({ item, label })}
                                <span class="option">{@html label}</span>
                            {/snippet}
                        </Autocomplete>
                    </div>
                </div></Expand
            >

            <Expand open={isNew} title={$t('songs.sections.song-details')}>
                <div class="field-grid">
                    <div class="group sm">
                        <label for="key">{$t('songs.columns.key')}</label>
                        <SelectKey bind:value={editSong.key} />
                    </div>

                    <div class="group sm">
                        <label for="bpm">{$t('songs.columns.bpm')}</label>
                        <input
                            id="bpm"
                            type="number"
                            min="40"
                            max="280"
                            step="1"
                            bind:value={editSong.bpm}
                            placeholder="120"
                        />
                    </div>

                    <div class="group sm">
                        <label for="time">{$t('songs.columns.time')}</label>
                        <Autocomplete
                            className="sm"
                            inputClassName="sm"
                            hideArrow={true}
                            minCharactersToSearch={0}
                            items={TIME_PRESETS}
                            showClear={true}
                            bind:text={editSong.time}
                        >
                            {#snippet item({ item, label })}
                                <span class="option">{@html label}</span>
                            {/snippet}
                        </Autocomplete>
                    </div>

                    <div class="group sm">
                        <label for="difficulty">
                            {$t('songs.columns.difficulty')}
                            {#if editSong.difficulty != null}
                                <span class="label difficulty-value"
                                    style:color={difficultyColor.isDark() ? '#eee' : '#444'}
                                    style:background-color={difficultyColor.hex()}>
                                    {editSong.difficulty}/10
                                </span>
                            {/if}
                        </label>
                        <input
                            id="difficulty"
                            style:accent-color={difficultyColor.hex()}
                            type="range"
                            min="1"
                            max="10"
                            step="1"
                            bind:value={editSong.difficulty}
                        />
                    </div>

                    <div class="group span-full">
                        <label for="source">
                            {$t('songs.columns.source')}
                        </label>
                        <input
                            id="source"
                            type="text"
                            bind:value={editSong.source}
                            placeholder="{$t('songs.hint-markdown')} [Sheet Music](https://...)"
                        />
                    </div>

                    <div class="group span-full">
                        <label for="features">
                            {$t('songs.columns.features')}
                        </label>
                        <input
                            id="feature"
                            placeholder={$t('songs.hint-label')}
                            type="text"
                            onkeydown={(e) => addLabel(e, 'features')}
                        />
                        <div class="flex labels">
                            {#each editSong.features as label}
                                <span class="label">{label}</span>
                            {/each}
                        </div>
                    </div>
                </div>
            </Expand>

            <Expand open={!isNew} title={$t('songs.sections.mydata')}>
                <div class="field-grid">
                    <div class="group span-full">
                        <label for="uri">
                            {$t('songs.columns.uri')}
                            {#if editSong.uri}
                                <a href={editSong.uri} title={$t('songs.menu.open')} target="_blank" rel="noopener">
                                    <i class="bx bx-link-external"></i>
                                </a>
                            {/if}
                        </label>
                        <input id="uri" type="url" bind:value={editSong.uri} placeholder="{$t('songs.hint-uri')}: https://example.com/sheet-music.pdf" />
                    </div>

                    <div class="group span-full">
                        <label for="tags">
                            {$t('songs.columns.tags')}
                        </label>
                        <input
                            id="tag"
                            placeholder={$t('songs.hint-label')}
                            class="lg"
                            type="text"
                            onkeydown={(e) => addLabel(e, 'tags')}
                        />
                        <div class="flex labels">
                            {#each editSong.tags as label}
                                <span class="label">{label}</span>
                            {/each}
                        </div>
                    </div>

                    <div class="group span-full">
                        <label for="notes">{$t('songs.columns.notes')}</label>
                        <textarea id="notes" bind:value={editSong.notes} placeholder="..."></textarea>
                    </div>
                </div>
            </Expand>
        </div>

        {#if !songService.hasUser()}
            <div class="warn">{$t('songs.noPersist')}</div>
        {/if}
    </ConfirmDialog>
</form>

<style lang="scss">
    .dialog-body {
        padding: 1em;
        display: flex;
        flex-direction: column;
        gap: 0.5em;
        min-width: min(80vw, 600px);
        height: 100%;
        overflow-y: auto;
    }

    .field-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 0.5em 1em;
        align-items: start;

        @media (max-width: 540px) {
            grid-template-columns: 1fr 1fr;
            .sm {
                grid-column: span 1;
            }
            .span-full {
                grid-column: 1 / -1;
            }
        }
        @media (max-width: 320px) {
            grid-template-columns: 1fr;
            .sm,
            .span-full {
                grid-column: 1 / -1;
            }
        }
    }

    .group {
        grid-column: span 2;
    }
    .group.sm {
        grid-column: span 1;
    }
    .span-full {
        grid-column: 1 / -1;
    }

    .group {
        display: flex;
        flex-direction: column;
        gap: 0.25em;
    }

    div.square {
        display: inline-block;
        width: 1.2em;
        height: 1.2em;
    }

    .difficulty-value {
        font-weight: 600;
        margin-left: 0.4em;
        color: var(--textghost);
    }
    
    #notes {
        resize: vertical;
        height: 32vh;
        width: 100%;
        box-sizing: border-box;

        &:focus {
            outline: 1px solid var(--primary);
            border-color: var(--primary);
        }
    }

    .warn {
        padding: 0.4em 1em;
        border: 1px solid var(--primselect);
        background-color: var(--secondary-opaque);
        text-align: center;
        white-space: nowrap;

        &::before {
            font-family: 'boxicons';
            padding-right: 0.2em;
            content: '\ea27';
        }
    }
</style>
