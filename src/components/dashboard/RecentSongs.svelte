<script lang="ts">
    import { t } from 'svelte-i18n';
    import { flip } from 'svelte/animate';
    import { map } from 'rxjs';
    import { settings } from '../../store/user-settings.svelte';
    import SongService from '../../service/user/user-song.service';
    import type { UserSong } from '../../model/song.model';
    import { unfold } from '../ui/helper/transition.helper';
    import { toDate, truncateTime } from '../ui/helper/date.helper';
    import { toStore } from '../../utils/rx.store';
    import SongCard from './SongCard.svelte';
    import SongStats from './SongStats.svelte';

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

    // Avoid storing a reference to settings.dashboard!
    // assignment captures the object at init time and won't 
    // reflect later replacements of the property.
    const filterByFav = (song: UserSong): boolean => 
        settings.dashboard.fav !== null ? song.fav === settings.dashboard.fav : true;
    const filterByStatus = (song: UserSong): boolean => 
        settings.dashboard.status[song.status];
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
</script>

<section class="recent-songs">
    <SongStats />
    
    <header class="header">
        <div class="title">
            <i class="bx bx-history"></i>
            {$t('songs.recent-wip')}
        </div>
    </header>

    {#if recentSongs.length > 0}
        <div id="recent-songs" class="card-grid">
            {#each recentSongs as song (song.id)}
                <div class="card-wrapper" animate:flip={{ duration: 150 }} transition:unfold>
                    <SongCard {song} />
                </div>
            {/each}
        </div>
        <hr class="divider" />
    {/if}

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
        <div id="current-songs" class="card-grid">
            {#each currentSongs as song (song.id)}
                <div class="card-wrapper" animate:flip={{ duration: 150 }} transition:unfold>
                    <SongCard {song} />
                </div>
            {/each}
        </div>
    {/if}
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
