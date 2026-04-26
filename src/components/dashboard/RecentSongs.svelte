<script lang="ts">
    import { t } from 'svelte-i18n';
    import { flip } from 'svelte/animate';
    import { map } from 'rxjs';
    import SongService from '../../service/user-song.service';
    import { unfold } from '../ui/transition.helper';
    import { toDate } from '../table/templates/Formatter.class';
    import { toStore } from '../../utils/rx.store';
    import SongCard from './SongCard.svelte';
    import Switch from '../ui/elements/Switch.svelte';

    const MAX = 12;

    let limit = 4, showDone = false;

    const service = new SongService();
    const recentSongStore = toStore(
        service.usersongs.pipe(
            map((songs) =>
                [...songs]
                    .filter((s) => s.changedAt)
                    .sort((a, b) => toDate(b.changedAt).getTime() - toDate(a.changedAt).getTime())
            )
        ),
        []
    );

    $: recentSongs = $recentSongStore.filter((s) => showDone || s.status !== 'done').slice(0, limit);
</script>

<section class="recent-songs">
    <header class="row">
        <div class="title"><i class="bx bxs-playlist"></i> {$t('songs.recent-wip')}</div>
        <div class="controls">
            <input type="range" min="2" max={MAX} step="2" bind:value={limit} aria-label={$t('songs.recent-limit')} />
            <span class="limit-val">{limit}</span>
            <Switch title="{ $t(`songs.${!showDone ? 'incl-done' : 'excl-done'}`) }"
                state={showDone}
                on:toggle={() => showDone = !showDone}>
                <span>
                    { $t(`songs.${!showDone ? 'incl-done' : 'excl-done'}`) }
                </span>
                <i class="icon bx" class:bx-check={!showDone} class:bx-x={showDone}></i> 
            </Switch>
        </div>
    </header>

    {#if recentSongs.length === 0}
        <p class="empty">{$t('songs.nosongs')}</p>
    {:else}
        <div class="card-grid">
            {#each recentSongs as song (song.id)}
                <div class="card-wrapper" animate:flip={{ duration: 150 }} transition:unfold>
                    <SongCard {song} {service} />
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

        .controls {
            display: flex;
            align-items: center;
            gap: 8px;

            input[type='range'] {
                width: 80px;
                accent-color: var(--primary);
            }

            .limit-val {
                font-size: 13px;
                color: var(--textghost);
                min-width: 16px;
                text-align: right;
            }
        }
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
