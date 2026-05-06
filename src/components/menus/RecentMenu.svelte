<script lang="ts">
    import { t } from "svelte-i18n";
    import Switch from "../ui/elements/Switch.svelte";
    import { status} from "../../model/types";
    import { MAX_LIMIT, recentFilter } from "../../service/user/recent-songs.svelte";

</script>

<section class="menu">
    <div class="row">
        <p class="controls">
            <label for="limit" class="icon limit-val">{recentFilter.limit}</label>
            <input type="range" title={$t('songs.recent-limit')}
                bind:value={recentFilter.limit}
                min="2" max={MAX_LIMIT} step="2" 
                aria-label={$t('songs.recent-limit')} />
        </p>
    </div>
    <div class="options">
        <span>
            <Switch title="{$t('menu.table.filter-by')} {$t('songs.columns.fav')}"
                bind:state={recentFilter.fav}
                icon={recentFilter.fav === undefined ? "bx-minus" : "bx-check"}
                options={[undefined, true, false]}
                onToggle={(state) => {}} />
            <span>&nbsp;⭐️&nbsp;
                {$t('songs.columns.fav')}
                {#if recentFilter.fav === undefined}
                    ({$t('table.filter.empty')})
                {/if}
            </span>
        </span>
    </div>
    <div class="options">
    {#each Object.keys(status) as s}       
        <p>
            <Switch title="{ $t('menu.table.filter-by') } {s}"
                icon={recentFilter.status[s] ? "bx-check" : "bx-minus"}
                state={recentFilter.status[s]} 
                onToggle={() => recentFilter.status[s] = !recentFilter.status[s]} />
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