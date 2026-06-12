<script lang="ts">
    import { t } from 'svelte-i18n';
    import Autocomplete from 'simple-svelte-autocomplete/src/SimpleAutocomplete.svelte';
    import '../../styles/overrides/simple-autocomplete.scss';
    import SongService from '../../service/user/user-song.service';
    import type { Artist, Song, UserSong } from '../../model/song.model';
    import { createDeferred } from '../../utils/promise.helper';
    import { buildArtistImgUrl } from '../../service/catalog/artists.util';
    import { refData } from '../../service/common/app.service';
    import { logAction } from '../../store/notification.store';
    import { redToGreenRange } from '../../styles/style.helper';
    import ConfirmDialog from './ConfirmDialog.svelte';
    import SelectKey from '../ui/SelectKey.svelte';
    import Expand from '../ui/elements/Expand.svelte';
    import Image from '../ui/elements/Image.svelte';
    import TagEditor from '../ui/elements/TagEditor.svelte';
    import CloudResource from '../storage/CloudResource.svelte';

    const TIME_PRESETS = ['4/4', '3/4', '6/8', '2/4', '12/8', '5/4', '7/8', '2/2'];
    const songService = new SongService();
    let form: HTMLFormElement = $state();
    let visible = $state(false);
    let editSong: Partial<UserSong> = $state({ features: [], tags: [] });
    const isNew = $derived(editSong.id === undefined);
    const difficultyColor = $derived(redToGreenRange(100 - editSong.difficulty * 10));
    const styles = (genre: string) => (refData.genres.find((v) => v.name === genre))?.styles ?? [];
    let deferred: ReturnType<typeof createDeferred<UserSong>> | null = null;

    export function showDialog(initial?: Partial<UserSong>): Promise<UserSong> {
        deferred = createDeferred<UserSong>();
        editSong = { features: [], tags: [], ...initial };
        visible = true;
        return deferred.promise;
    }

    function wordStartsWith(text: string, search: string): boolean {
        return text.toLowerCase()
            .split(/\s+/)
            .some((v) => v.startsWith(search.toLowerCase()));
    }

    function setArtist(artist?: Artist): void {
        if (artist) {
            logAction({ type: 'search', artist });
    
            editSong.artistMbid = artist.artistMbid;
            editSong.artist = artist.names[0];

            if (!editSong.genre) {
                editSong.genre = artist.genre;
            }
            if (!editSong.style) {
                editSong.style = artist.style;
            }
            if (artist?.country) {
                editSong.features?.push(artist.country)
            }
        }
    }

    function setSong(song?: Song) {
        if (song) {
            logAction({ type: 'search', song });

            editSong = {
                ...song,
                ...editSong
            }
            editSong.features.push(...song.features ?? []);
        }
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
                        <label for="artist">{$t('songs.columns.artist')} *</label>
                        <Autocomplete 
                            inputClassName="lg" 
                            labelFieldName="names"
                            placeholder={$t('songs.columns.artist')} 
                            required={true}
                            delay={500}
                            minCharactersToSearch={1}
                            searchFunction={(text) => refData.artists.filter((v) => wordStartsWith(v.names[0], text))}
                            onChange={setArtist}
                            bind:value={editSong.artistMbid} 
                            showClear={true}
                            hideArrow={true}
                            showLoadingIndicator={true}>
                            {#snippet item({ item, label })}
                            <div class="result-card">
                                <span title={item.names[0]}>
                                    <Image src={buildArtistImgUrl(item.artistMbid)} />
                                </span>
                                <div class="col">
                                    {@html label} | 
                                    <span title="{ $t('songs.columns.country') }">{item.country ?? 'n/a'}</span>
                                    {#if item.website}
                                    <a title="{ $t('songs.columns.artist') }" href={item.website} target="_blank">
                                        <i class="bx bx-external-link"></i>
                                    </a>
                                    {/if}
                                    <p>
                                        {#if item.genre}
                                        <span class='label'>{item.genre}</span>
                                        {/if}
                                        {#if item.style && item.style !== item.genre}
                                        <span class='label'>{item.style}</span>
                                        {/if}
                                    </p>
                                </div>
                            </div>
                            {/snippet}
                        </Autocomplete>
                    </div>
                    
                    <div class="group">
                        <label for="title">{$t('songs.columns.title')} *</label>
                        <Autocomplete 
                            inputClassName="lg" 
                            labelFieldName="title"
                            placeholder={$t('songs.columns.title')}
                            required={true}
                            delay={500} 
                            minCharactersToSearch={editSong.artistMbid ? 0 : 2}
                            searchFunction={(text) => refData.catalog.filter((v) => !editSong.artistMbid || v.artistMbid === editSong.artistMbid && wordStartsWith(v.title, text))} 
                            onChange={setSong} 
                            bind:text={editSong.title}
                            clearSelection={() => setSong()} 
                            showClear={true}
                            hideArrow={true}
                            showLoadingIndicator={true}>
                            {#snippet item({ item, label })}
                                <div class="result-card">
                                    <span title={item.title}>
                                        <Image src={buildArtistImgUrl(item.artistMbid)} />
                                    </span>
                                    <div class="col">
                                        {@html label} | 
                                        <span class="eyebrow" title="{ $t('songs.columns.artist') }">{item.artist}</span>
                                        {#if item.year}
                                        <span class="sub" title="{ $t('songs.columns.year') }">({item.year})</span>
                                        {/if}
                                        <p>
                                            {#if item.genre}
                                            <span title="{ $t('songs.columns.genre') }" class='label'>{item.genre}</span>
                                            {/if}
                                            {#if item.style}
                                            <span title="{ $t('songs.columns.style') }" class='label'>{item.style}</span>
                                            {/if}
                                            {#if item.key || item.time || item.bpm}
                                            <span title="{ $t('songs.columns.signature') }" class='label'>
                                                {[item.key, item.time, item.bpm].join('|')}
                                            </span>
                                            {/if}
                                        </p>
                                    </div>
                                </div>
                            {/snippet}
                        </Autocomplete>
                    </div>

                    <div class="group">
                        <label for="genre">{$t('songs.columns.genre')}</label>
                        <Autocomplete
                            inputClassName="lg"
                            labelFieldName="name"
                            placeholder="genre"
                            minCharactersToSearch={0}
                            items={refData.genres}
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
                            searchFunction={() => styles(editSong.genre)}
                            showClear={true}
                            bind:text={editSong.style}
                        >
                            {#snippet item({ item, label })}
                                <span class="option">{@html label}</span>
                            {/snippet}
                        </Autocomplete>
                    </div>
                </div>
            </Expand>

            <Expand open={isNew} title={$t('songs.sections.song-details')}>
                <div class="field-grid">
                    <div class="group sm">
                        <label for="key">{$t('songs.columns.key')}</label>
                        <SelectKey bind:value={editSong.key} />
                    </div>

                    <div class="group sm">
                        <label for="bpm">{$t('songs.columns.bpm')}</label>
                        <input class="lg"
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
                        <input class="lg"
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
                        <input class="lg"
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
                        <TagEditor bind:labels={editSong.features} />
                    </div>
                </div>
            </Expand>

            <Expand open={!isNew} title={$t('songs.sections.mydata')}>
                <div class="field-grid">
                    <div class="group span-full">
                        <CloudResource title={$t('songs.columns.uri')} bind:uri={editSong.uri} />
                    </div>

                    <div class="group span-full">
                        <label for="tags">
                            {$t('songs.columns.tags')}
                        </label>
                        <TagEditor bind:labels={editSong.tags} />
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

    .result-card {
        display: flex;
        align-items: center;
        gap: 0.75em;
        padding: 0.45em 0.75em;
        color: var(--text);

        a {
            flex-shrink: 0;
        }
    }

    div.square {
        display: inline-block;
        width: 1.2em;
        height: 1.2em;
    }

    .difficulty-value {
        font-weight: 600;
        margin-left: 0.4em;
        color: var(--text-muted);
    }
    
    #notes {
        resize: vertical;
        height: 32vh;
        width: 100%;
        box-sizing: border-box;

        &:focus {
            outline: 1px solid var(--accent);
            border-color: var(--accent);
        }
    }

    .warn {
        padding: 0.4em 1em;
        border: 1px solid var(--surface-mid);
        background-color: var(--highlight-t);
        text-align: center;
        white-space: nowrap;

        &::before {
            font-family: 'boxicons';
            padding-right: 0.2em;
            content: '\ea27';
        }
    }
</style>
