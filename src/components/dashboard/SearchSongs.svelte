<script lang="ts">
    import { t } from 'svelte-i18n';
    import { getContext } from 'svelte';
    import { cubicOut } from 'svelte/easing';
    import { slide } from 'svelte/transition';
    import Autocomplete from '../ui/Autocomplete.svelte';
    import Image from '../ui/elements/Image.svelte';
    import SongService from '../../service/user/user-song.service';
    import { createSearchService } from '../../service/search/search.service';
    import { parseSearchQuery } from '../../utils/parse-search-query';
    import type { Dialog } from '../../model/dialog.model';
    import type { SongResult } from '../../model/songbpm.model';
    import type { UserSong } from '../../model/song.model';
    import type { SearchEngines } from '../../model/types';
    import { logAction } from '../../store/notification.store';

    const songService = new SongService();
    const addSongDialog = getContext<Dialog<UserSong>>('editsong-dialog');

    let currentSearchEngine = $state<SearchEngines>('songbpm');
    const searchService = $derived(createSearchService(currentSearchEngine));

    let autocomplete: { close: () => void };
    let searchText = $state('');
    let showFilter = $state(false);

    const parsedQuery = $derived(parseSearchQuery(searchText));

    function mapSongResult(song: SongResult): Partial<UserSong> {
        const mapped: Partial<UserSong> = {
            title: song.title,
            bpm: song.tempo,
            key: song.key_of,
            time: song.time_sig,
            artist: song.artist?.name,
            artistImg: song.artist?.img,
            features: [],
            tags: [],
        };
        if (song.album?.title && song.album?.uri) {
            mapped.source = `[${song.album.title}](${song.album.uri})`;
        }
        if (song.artist?.genres?.length) {
            mapped.genre = song.artist.genres[0];
            if (song.artist.genres.length > 1) {
                mapped.style = song.artist.genres.slice(1).join(', ');
            }
        }
        if (song.artist?.from) {
            mapped.features = [song.artist.from];
        }
        logAction({ type: 'search', song });
        return mapped;
    }

    function handleSelect(song: SongResult | null): void {
        if (song) {
            songService.addSong(mapSongResult(song)).then(() => (searchText = ''));
        }
    }

    async function openCustomForm(): Promise<void> {
        autocomplete.close();
        const newSong = await addSongDialog.open({ title: searchText } as UserSong);
        if (newSong !== null) {
            await songService.addSong(newSong);
        }
    }
</script>

<div class="search-song">
    <div class="search-row">
        <Autocomplete
            bind:this={autocomplete}
            bind:value={searchText}
            searchFunction={(q) => searchService.findSongs(parsedQuery.title, parsedQuery.artist)}
            labelField="title"
            delay={400}
            minChars={2}
            placeholder={$t('start.search.placeholder')}
            onSelect={handleSelect}
        >
            {#snippet item({ item })}
                <div class="result-card">
                    <a href={item.album?.uri ?? item.artist?.uri} target="_blank" tabindex="-1">
                        <Image src={item.album?.img ?? item.artist?.img} />
                    </a>
                    <div class="result-info">
                        <span class="result-title">{item.title}</span>
                        <span class="result-artist">{item.artist?.name ?? ''}</span>
                        <div class="result-meta">
                            {#if item.tempo}
                                <span class="label">{item.tempo} bpm</span>
                            {/if}
                            {#if item.key_of}
                                <span class="label">{item.key_of}</span>
                            {/if}
                            {#if item.time_sig}
                                <span class="label">{item.time_sig}</span>
                            {/if}
                        </div>
                    </div>
                </div>
            {/snippet}

            {#snippet header()}
                <button class="custom-btn" onclick={openCustomForm}>
                    <i class="bx bx-plus-circle"></i>
                    {$t('start.search.custom')}
                </button>
            {/snippet}
        </Autocomplete>

        <!-- svelte-ignore a11y_interactive_supports_focus -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <span class="toggle-filter" role="button" onclick={() => (showFilter = !showFilter)}>
            <i class="bx bx-cog"></i>
        </span>
    </div>

    {#if showFilter}
        <div class="controls" transition:slide={{ duration: 200, easing: cubicOut }}>
            <p>
                <label for="provider">{$t('menu.search.select-provider')}:</label>
                <select bind:value={currentSearchEngine}>
                    <option value="songbpm">GetSongBPM</option>
                    <option value="audius">Audius</option>
                </select>
            </p>
        </div>
    {/if}
</div>

<style lang="scss">
    select {
        border-width: 0 0 1px 0;
        background-color: transparent;
        color: var(--primary);
        font-weight: 600;
        outline: none;

        option {
            color: var(--text);
        }
    }

    .search-song {
        width: 100%;
    }

    .search-row {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;

        :global(.sac-input) {
            padding-right: 7em;
        }
    }

    .toggle-filter {
        position: absolute;
        top: 0;
        right: 0;
        color: var(--primselect);
        cursor: pointer;
        user-select: none;
        padding: 0.5em;
        z-index: 1;

        &:hover {
            color: var(--text);
        }
    }

    .query-hint {
        display: inline-flex;
        align-items: center;
        gap: 0.3em;
        font-size: 0.8em;
        color: var(--text-muted, #888);
        padding: 0.2em 0.75em 0.4em;
    }

    .result-card {
        display: flex;
        align-items: center;
        gap: 0.75em;
        padding: 0.45em 0.75em;

        a {
            flex-shrink: 0;
        }
    }

    .result-info {
        display: flex;
        flex-direction: column;
        gap: 0.1em;
        min-width: 0;
    }

    .result-title {
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .result-artist {
        font-size: 0.85em;
        color: var(--text-muted, #666);
    }

    .result-meta {
        display: flex;
        gap: 0.3em;
        flex-wrap: wrap;
        margin-top: 0.15em;
    }

    .custom-btn {
        display: flex;
        align-items: center;
        gap: 0.45em;
        width: 100%;
        padding: 0.6em 0.75em;
        border: none;
        cursor: pointer;
        touch-action: manipulation;

        &:hover {
            background: var(--hover, rgba(0, 0, 0, 0.05));
        }

        svg {
            flex-shrink: 0;
        }
    }
</style>