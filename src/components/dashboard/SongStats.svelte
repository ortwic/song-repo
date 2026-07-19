<script lang="ts">
    import { t } from 'svelte-i18n';
    import { onMount } from 'svelte';
    import type { DashboardSettings } from '../../model/settings.model';
    import type { IndexEntry } from '../../utils/index-builder';
    import { type Status, STATUS_KEYS } from '../../model/app.types';
    import { settings, saveSettings } from '../../store/user-settings.svelte';
    import SongService from '../../service/user/user-song.service';
    import { currentMenu } from '../../store/app.store';
    import { createSongEntity } from '../../domain/song.entity';

    const EMPTY_STATS = {
        todo: 0,
        wip: 0,
        repeat: 0,
        done: 0,
        total: 0,
    };

    const icons = {
        todo: 'bx-pause',
        wip: 'bx-play',
        done: 'bxs-check-circle',
        repeat: 'bx-revision',
        archived: 'bx-archive-in',
    };

    const service = new SongService();

    let stats = $state(EMPTY_STATS);
    let mostUsedTags = $state<IndexEntry[]>([]);

    onMount(() => {
        const subs = [
            service.usersongs$.subscribe((songs) => stats = STATUS_KEYS.reduce((acc, s) => {
                acc[s] = songs
                    .map((song) => createSongEntity(song, settings.advanced))
                    .filter((song) => song.resolvedStatus() === s).length;
                return acc;
            }, { total: songs.length } as typeof stats)),
            service.tagIndex$.subscribe((index) => mostUsedTags = index.values().take(3).toArray()),
        ];
        return () => subs.forEach((s) => s.unsubscribe());
    });

    function filterByStatus(ev: Event, value?: Status) {
        ev.preventDefault();

        const status = STATUS_KEYS.reduce((acc, s) => {
            acc[s] = !value || s === value;
            return acc;
        }, {} as Record<Status, boolean>);
        setFilter({ status });
        scrollToSection('current-songs');
    }

    function filterByTag(ev: Event, e?: IndexEntry) {
        ev.preventDefault();

        const tag = e && {
            type: e.type as 'tag' | 'feature', value: e.value 
        } || null;
        setFilter({ tag });
        scrollToSection('current-songs');
    }

    function setFilter(filter: Partial<DashboardSettings>) {
        saveSettings('dashboard', {
            ...settings.dashboard,
            ...filter
        })
    }

    function showAdvancedFilters(ev: Event) {
        ev.preventDefault();
        settings.dashboard.expands.showRecentFilter = true;
        saveSettings('dashboard', settings.dashboard);
        currentMenu.set('dynamic');
    }

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
</script>

<section class="song-stats">
    <div class="stats-row">
        {#each STATUS_KEYS as key}
            {#if stats[key]}
            <a role="button" href="#current-songs" class="label stat" onclick={(e) => filterByStatus(e, key)}>
                <i class="bx {icons[key]}" aria-hidden="true"></i>
                {stats[key]} {$t(`songs.status.${key}`)}
            </a>
            {/if}
        {/each}
        <a role="button" href="#current-songs" class="label stat" onclick={(e) => filterByStatus(e)}>
            <i class="bx bxs-playlist" aria-hidden="true"></i>
            {stats.total} {$t(`common.total`)}
        </a>
        {#each mostUsedTags as tag}
            <a role="button" href="#current-songs" class="label stat" onclick={(e) => filterByTag(e, tag)}>
                <i class="bx bx-tag" aria-hidden="true"></i>
                {tag.value} ({tag.count})
            </a>
        {/each}
        <a role="button" href="#current-songs" class="label stat" onclick={(e) => filterByTag(e)}>
                <i class="bx bx-x" aria-hidden="true"></i>
                {$t('table.filter.empty')}
        </a>
        <a role="button" href="#current-songs" class="label stat" title="{$t('common.more')}" onclick={showAdvancedFilters}>
            <i class="bx bx-filter"></i> ...
        </a>
    </div>
</section>

<style lang="scss">
    .max-3 > :nth-child(n + 4) {
        display: none;
    }
 
    .stats-row {
        display: flex;
        flex-wrap: wrap;
 
        .break {
            flex-basis: 100%;
            height: 0;
        }
    }

    a.label {
        cursor: pointer;

        &.accent {
            border-color: var(--accent);
            color: var(--accent);
        }
    }
</style>