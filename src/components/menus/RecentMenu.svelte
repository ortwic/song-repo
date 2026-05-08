<script lang="ts">
    import { t } from "svelte-i18n";
    import Switch from "../ui/elements/Switch.svelte";
    import { type Status, status } from "../../model/types";
    import { MAX_SONGVIEW_LIMIT, settings, saveSettings } from "../../store/user-settings.svelte";

    const recentFilter = $state(settings.dashboard);

    function updateFilter() {
        saveSettings('dashboard', recentFilter);
    }

    function toggleStatus(s: Status) {
        recentFilter.status[s] = !recentFilter.status[s];
        updateFilter();
    }
</script>

<section class="menu">
    <div class="row">
        <p class="controls">
            <label for="limit" class="icon limit-val">{recentFilter.limit}</label>
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
        </p>
    </div>

    <div class="options">
        <span>
            <Switch
                title="{$t('menu.table.filter-by')} {$t('songs.columns.fav')}"
                bind:state={recentFilter.fav}
                icon={recentFilter.fav === null ? "bx-minus" : "bx-check"}
                options={[null, true, false]}
                onToggle={updateFilter}
            />
            <span>&nbsp;⭐️&nbsp;
                {$t('songs.columns.fav')}
                {#if recentFilter.fav === null}
                    ({$t('table.filter.empty')})
                {/if}
            </span>
        </span>
    </div>

    <div class="options">
        {#each Object.keys(status) as s}
            <p>
                <Switch
                    title="{$t('menu.table.filter-by')} {s}"
                    icon={recentFilter.status[s] ? "bx-check" : "bx-minus"}
                    state={recentFilter.status[s]}
                    onToggle={() => toggleStatus(s as Status)}
                />
                <span class="status {s}">&nbsp; {$t(`songs.status.${s}`)}</span>
            </p>
        {/each}
    </div>
</section>

<style lang="scss">
    input[type='range'] {
        width: 80px;
        accent-color: var(--primary);
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
                padding-left: .2em;
            }

            span.active {
                color: var(--primary);
                font-weight: 500;
            }
        }
    }
</style>