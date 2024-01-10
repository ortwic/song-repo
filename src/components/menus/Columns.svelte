<script lang="ts">
    import { t } from "svelte-i18n";
    import type { SortDirection, Sorter } from "tabulator-tables";
    import Switch from "../ui/elements/Switch.svelte";
    import { tableView as view } from "../../store/app.store";

    const columns = $view?.table.getColumnDefinitions()
        .filter(c => !c.field.startsWith('__'));
    
    const sortEntry = <T>(acc: { [x: string]: T; }, { field, dir }) => {
        acc[field] = dir;
        return acc;
    };
    const sortedFields = $view?.table.getSorters()
        .reduce(sortEntry, {} as Record<string, SortDirection>);

    function sortBy(column: string, dir?: SortDirection) {
        sortedFields[column] = dir;
        if (!dir) {
            delete sortedFields[column];
        }

        const sorter = Object.keys(sortedFields)
            .map((field: string): Sorter => ({ 
                column: field, 
                dir: sortedFields[field] 
            }));
        $view?.table.setSort(sorter);
    }

    function filterBy(column: string, value: string) {
        $view?.table.setHeaderFilterValue(column, value);
    }

</script>

<section class="menu">
    <div class="options">
        {#each columns ?? [] as col}
            <p>
                <Switch title="{ $t('menu.table.show-hide') } {col.title}"
                    state={col.visible !== false}
                    on:click={() => $view?.table.getColumn(col.field).toggle()}>
                    <i class="bx bx-show"></i> 
                </Switch>
                <Switch title="{ $t('menu.table.group-by') } {col.title}"
                    state={$view?.groups.includes(col.field)}
                    on:click={() => $view?.toggleGroup(col.field)}>
                    <i class="bx bx-collection bx-flip-vertical"></i> 
                </Switch>
                <Switch title="{ $t('menu.table.sort-by') } {col.title}"
                    state={sortedFields[col.field] ?? null}
                    options={[null, 'asc', 'desc']}
                    on:click={({ detail }) => sortBy(col.field, detail)}>
                    <i class="bx {sortedFields[col.field] ?? 'asc'}"></i>
                </Switch>
                {#if col.headerFilter === 'tickCross'}
                    <Switch title="{ $t('menu.table.filter-by') } {col.title}"
                        state={sortedFields[col.field] ?? null}
                        options={[undefined, true, false]}
                        on:click={({ detail }) => filterBy(col.field, detail)}>
                        <i class="bx bx-filter-alt"></i>
                    </Switch>
                {/if}
                <span>{col.title}</span>
            </p>
        {/each}
    </div>
</section>

<style lang="scss">
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
        }

        i.bx.asc::before {
            font-family: 'boxicons';
            content: "\ec96"; // bxs-chevron-up
        }

        i.bx.desc::before {
            font-family: 'boxicons';
            content: "\ec89"; // bxs-chevron-down
        }
    }
</style>