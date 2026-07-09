<script lang="ts">
    import { t } from 'svelte-i18n';
    import { cubicOut } from 'svelte/easing';
    import { slide } from 'svelte/transition';
    import Autocomplete from '../ui/Autocomplete.svelte';
    import Image from '../ui/elements/Image.svelte';
    import SongService from '../../service/user/user-song.service';
    import { buildArtistImgUrl } from '../../service/catalog/artists.util';
    import { createSearchService } from '../../service/catalog/search.service';
    import { openDialog } from '../dialog-context.svelte';
    import type { Song, UserSong } from '../../model/song.model';
    import type { SearchEngines } from '../../model/app.types';
    import { logAction } from '../../store/notification.store';

    const songService = new SongService();

    let currentSearchEngine = $state<SearchEngines>();
    const searchService = $derived(createSearchService(currentSearchEngine));

    let autocomplete: { close: () => void };
    let searchTerm = $state('');
    let showFilter = $state(false);

    async function handleSelect(song: Song | null): Promise<void> {
        if (song) {
            logAction({ type: 'search', song });
            await songService.addSong({
                id: song.id,
                artist: song.artist,
                artistImg: song.artistImg,
                artistMbid: song.artistMbid,
                title: song.title,
                album: song.album,
                genre: song.genre,
                style: song.style,
                mood: song.mood,
                difficulty: song.difficulty,
                key: song.key,
                time: song.time,
                bpm: song.bpm,
                year: song.year,
                uri: song.uri,
                features: song.features ?? [],
                tags: [],
                mastery: {}
            } as UserSong);
            searchTerm = '';
        }
    }

    async function openCustomForm(): Promise<void> {
        autocomplete.close();
        const newSong = await openDialog<UserSong, UserSong>('EditSongDialog', { title: searchTerm } as UserSong);
        if (newSong !== null) {
            await songService.addSong(newSong);
        }
    }
</script>

<div class="search-song">
    <label for="search" class="muted">{$t('songs.addTitleCatalog')}</label>
    <div class="search-row">
        <Autocomplete
            bind:this={autocomplete}
            bind:value={searchTerm}
            searchFunction={() => searchService.findSongs(searchTerm)}
            labelField="title"
            delay={400}
            minChars={2}
            placeholder={currentSearchEngine 
                ? $t('start.search.online') 
                : $t('start.search.catalog')}
            onSelect={handleSelect}
        >
            {#snippet item({ item })}
                <div class="result-card">
                    <Image src={buildArtistImgUrl(item.artistMbid)} size={80} />
                    <div class="result-info">
                        <span class="result-title">{item.title}</span>
                        <span class="result-artist">{item.artist ?? ''}</span>
                        <div class="result-meta">
                            {#each [
                                item.bpm ? `${item.bpm} bpm` : null,
                                item.key,
                                item.time,
                                item.genre,
                            ].filter(Boolean) as label}
                                <span class="label">{label}</span>
                            {/each}
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
                    <option value="">{import.meta.env.PACKAGE_NAME}</option>
                    <option value="musicbrainz">MusicBrainz</option>
                    <option value="discogs">Discogs</option>
                    <option value="audius">Audius</option>
                    <option value="songbpm">GetSongBPM</option>
                </select>
            </p>
        </div>
    {/if}
</div>

<style lang="scss">
    select {
        border-width: 0 0 1px 0;
        background-color: transparent;
        color: var(--accent);
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
        color: var(--surface-mid);
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