<script lang="ts">
    import { t } from 'svelte-i18n';
    import { flip } from 'svelte/animate';
    import { map } from 'rxjs';
    import { settings } from '../../store/user-settings.svelte';
    import SongService from '../../service/user/user-song.service';
    import type { UserSong } from '../../model/song.model';
    import { unfold } from '../ui/helper/transition.helper';
    import { truncateTime } from '../ui/helper/date.helper';
    import { toStore } from '../../utils/rx.store';
    import SongCard from './SongCard.svelte';

    const service = new SongService();
    const changedAtSorter = (a: UserSong, b: UserSong) => {
        const diff = truncateTime(b?.changedAt) - truncateTime(a.changedAt);
        return diff !== 0 ? diff : b.id.localeCompare(a.id);
    };
    const recentSongStore = toStore(
        service.usersongs.pipe(
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

    let recentSongs = $derived($recentSongStore
        .filter((s) => filterByFav(s) && filterByStatus(s))
        .slice(0, settings.dashboard.limit)
    );
</script>

<section class="recent-songs">
    <header class="row">
        <div class="title"><i class="bx bxs-playlist"></i> {$t('songs.recent-wip')}</div>
    </header>

    {#if recentSongs.length === 0}
        <p class="empty">{$t('songs.nosongs')}</p>
    {:else}
        <div class="card-grid">
            {#each recentSongs as song (song.id)}
                <div class="card-wrapper" animate:flip={{ duration: 150 }} transition:unfold>
                    <SongCard {song} />
                </div>
            {/each}
        </div>
    {/if}
</section>

<style lang="scss">
    .row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
        gap: 12px;

        .title {
            font-weight: 500;
            flex-shrink: 0;
        }
    }

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
        color: var(--textghost);
    }
</style>
