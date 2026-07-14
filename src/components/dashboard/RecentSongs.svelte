<script lang="ts">
    import { t } from 'svelte-i18n';
    import { flip } from 'svelte/animate';
    import { map } from 'rxjs';
    import { createSongEntity } from '../../domain/song.entity';
    import { toStore } from '../../interop/rx.store';
    import type { UserSong } from '../../model/song.model';
    import SongService from '../../service/user/user-song.service';
    import { saveSettings, settings } from '../../store/user-settings.svelte';
    import { toDate, truncateTime } from '../../utils/date.helper';
    import { unfold } from '../ui/helper/transition.helper';
    import Expand from '../ui/elements/Expand.svelte';
    import SongCard from './SongCard.svelte';

    const service = new SongService();
    const changedAtSorter = (a: UserSong, b: UserSong) => {
        const diff = truncateTime(b?.changedAt) - truncateTime(a.changedAt);
        return diff !== 0 ? diff : b.id.localeCompare(a.id);
    };
    const songStore = toStore(
        service.usersongs$.pipe(
            map((songs) => [...songs].sort(changedAtSorter))
        ),
        []
    );

    const status = (song: UserSong) => song.status ?? createSongEntity(song, settings.advanced).resolvedStatus();

    // Avoid storing a reference to settings.dashboard!
    // assignment captures the object at init time and won't 
    // reflect later replacements of the property.
    const filterByFav = (song: UserSong): boolean => 
        settings.dashboard.fav !== null ? song.fav === settings.dashboard.fav : true;
    const filterByStatus = (song: UserSong): boolean => 
        settings.dashboard.status[status(song)];
    const filterByDate = (song: UserSong): boolean => 
        song.changedAt && settings.dashboard.recentDays > -toDate(song.changedAt).diffNow('days').days;
    const filterByTag = (song: UserSong): boolean => 
        !settings.dashboard.tag || (settings.dashboard.tag.type === 'tag' 
            ? song.tags?.includes(settings.dashboard.tag.value) 
            : song.features?.includes(settings.dashboard.tag.value));

    let recentSongs = $derived($songStore
        .filter((s) => filterByDate(s))
        .slice(0, settings.dashboard.limit)
    );
    let currentSongs = $derived($songStore
        .filter((s) => !filterByDate(s) && filterByFav(s) && filterByStatus(s) && filterByTag(s))
        .slice(0, settings.dashboard.limit)
    );
    
    function updateFilter() {
        saveSettings('dashboard', settings.dashboard);
    }
</script>

<section class="recent-songs">
    {#if recentSongs.length > 0}
    <Expand title={$t('songs.recent-change')}
        icon='bx-history'
        bind:open={settings.dashboard.expands.showRecentChanges}
        onToggle={updateFilter}>
        <br>
        <div id="recent-songs" class="card-grid">
            {#each recentSongs as song (song.id)}
                <div class="card-wrapper" animate:flip={{ duration: 150 }} transition:unfold>
                    <SongCard {song} />
                </div>
            {/each}
        </div>
    </Expand>
    <br>
    {/if}

    <Expand title={$t('songs.recent-wip')}
        icon='bx-stopwatch'
        bind:open={settings.dashboard.expands.showRecentWip}
        onToggle={updateFilter}>
    {#if currentSongs.length === 0}
        <p class="empty">{$t('songs.search-empty')}</p>
        <h3>{$t('songs.search-filter-settings')}</h3>
        <ul>
            {#if settings.dashboard.tag}
                <li>{$t(`songs.columns.${settings.dashboard.tag.type}s`)}: {settings.dashboard.tag.value}</li>
            {/if}
            {#if settings.dashboard.fav !== null}
                <li>{$t('songs.columns.fav')}: {$t(`common.${settings.dashboard.fav}`)}</li>
            {/if}
            {#each Object.entries(settings.dashboard.status).filter(([, v]) => v) as [status]}
                <li>{$t('songs.columns.status')} {$t(`songs.status.${status}`)}</li>
            {/each}
        </ul>
    {:else}
        <br>
        <div id="current-songs" class="card-grid">
            {#each currentSongs as song (song.id)}
                <div class="card-wrapper" animate:flip={{ duration: 150 }} transition:unfold>
                    <SongCard {song} />
                </div>
            {/each}
        </div>
    {/if}
    </Expand>
</section>

<style lang="scss">
    .controls {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: .6em;
        padding: .6em 0;
    }

    .card-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-auto-rows: 1fr;
        gap: 12px;

        @media screen and (orientation: portrait) {
            grid-template-columns: 1fr;
        }
    }

    .hidden {
        display: none;
    }

    .empty {
        font-size: 14px;
        color: var(--text-muted);
    }
</style>
