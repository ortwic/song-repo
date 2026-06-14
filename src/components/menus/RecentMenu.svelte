<script lang="ts">
    import { t } from 'svelte-i18n';
    import { onMount } from 'svelte';
    import Autocomplete from 'simple-svelte-autocomplete/src/SimpleAutocomplete.svelte';
    import Switch from '../ui/elements/Switch.svelte';
    import { type Status, STATUS_KEYS } from '../../model/types';
    import type { IndexEntry } from '../../utils/index-builder';
    import SongService from '../../service/user/user-song.service';
    import { MAX_SONGVIEW_LIMIT, settings, saveSettings, MAX_SONGVIEW_DAYS } from '../../store/user-settings.svelte';
    import Expand from '../ui/elements/Expand.svelte';

    const songService = new SongService();
    const recentFilter = $state(settings.dashboard);
    let tagOptions = $state<IndexEntry[]>([]);

    onMount(() => {
        const sub = songService.tagIndex$.subscribe(value => tagOptions = [...value.entries().map(([_, v]) => v)]);
        return () => sub.unsubscribe();
    });

    function updateFilter() {
        saveSettings('dashboard', recentFilter);
    }

    function toggleStatus(s: Status) {
        recentFilter.status[s] = !recentFilter.status[s];
        updateFilter();
    }
</script>

<section class="menu">
    <div class="section">
        <Autocomplete
            inputClassName="lg"
            dropdownClassName="menu-filter-tag-dropdown"
            labelFieldName="value"
            placeholder={$t('menu.recent.tags')}
            minCharactersToSearch={0}
            items={tagOptions}
            showClear={true}
            bind:selectedItem={recentFilter.tag}
            hideArrow={true}
        >
            {#snippet item({ item, label })}
                <div class="option {item.type}">{@html label} ({item.count})</div>
            {/snippet}
        </Autocomplete>
    </div>

    <div class="options">
        <Expand bind:open={settings.dashboard.showFilter} 
            onToggle={updateFilter}
            icon='bx-filter'
            title={$t('menu.recent.filter')} >
            <p>
                <Switch
                    title="{$t('menu.table.filter-by')} {$t('songs.columns.fav')}"
                    bind:state={recentFilter.fav}
                    icon={recentFilter.fav === null ? 'bx-minus' : 'bx-check'}
                    options={[null, true, false]}
                    onToggle={updateFilter}
                />
                <span
                    >&nbsp;⭐️&nbsp;
                    {$t('songs.columns.fav')}
                    {#if recentFilter.fav === null}
                        ({$t('table.filter.empty')})
                    {/if}
                </span>
            </p>
            {#each STATUS_KEYS as s}
                <p>
                    <Switch
                        title="{$t('menu.table.filter-by')} {s}"
                        icon={recentFilter.status[s] ? 'bx-check' : 'bx-minus'}
                        state={recentFilter.status[s]}
                        onToggle={() => toggleStatus(s as Status)}
                    />
                    <span class="status {s}">&nbsp; {$t(`songs.status.${s}`)}</span>
                </p>
            {/each}
        </Expand>
    </div>

    <div class="row">
        <p class="controls">
            <i class="icon bx bx-history"></i>
            <input
                type="range"
                title={$t('songs.recent-days')}
                bind:value={recentFilter.recentDays}
                min="1"
                max={MAX_SONGVIEW_DAYS}
                step="1"
                aria-label={$t('songs.recent-days')}
                onchange={updateFilter}
            />
            <label for="days" class="icon limit-val">{recentFilter.recentDays}</label>
        </p>
    </div>
    <div class="row">
        <p class="controls">
            <i class="icon bx bxs-playlist"></i>
            <input
                type="range"
                title={$t('songs.recent-limit')}
                bind:value={recentFilter.limit}
                min="2"
                max={MAX_SONGVIEW_LIMIT}
                step="2"
                aria-label={$t('songs.recent-limit')}
                onchange={updateFilter}
            />
            <label for="limit" class="icon limit-val">{recentFilter.limit}</label>
        </p>
    </div>
</section>

<style lang="scss">
    input[type='range'] {
        width: 80px;
        accent-color: var(--accent);
    }

    :global(.menu-filter-tag-dropdown) {
        height: 320px;
        overflow-x: hidden;
    }

    .tag {
        background: var(--tag-bg);
    }

    .feature {
        background: var(--tag-hl-bg);
    }

    .controls {
        display: flex;
        align-items: center;
        gap: 8px;

        .limit-val {
            min-width: 2em;
        }
    }

    div.options {
        width: calc(100% - 2em);
        padding: 0 1em;
        text-align: left;

        p {
            width: calc(100% - 1em);
            white-space: nowrap;

            span {
                padding-left: 0.2em;
            }

            span.active {
                color: var(--accent);
                font-weight: 500;
            }
        }
    }
</style>
