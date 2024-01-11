<script lang="ts">
    import { t } from "svelte-i18n";
    import type { ColumnDefinition, SortDirection, Sorter } from "tabulator-tables";
    import Switch from "../ui/elements/Switch.svelte";
    import PopupMenu from "../ui/PopupMenu.svelte";
    import { tableView as view } from "../../store/app.store";

    const menus: Record<string, PopupMenu> = {};
    const columns = $view?.table.getColumnDefinitions()
        .filter(c => !c.field.startsWith('__'));
    
    const sortEntry = <T>(acc: { [x: string]: T; }, { field, dir }) => {
        acc[field] = dir;
        return acc;
    };
    const filterEntry = <T>(acc: { [x: string]: T; }, { field, type, value }) => {
        acc[field] = value;
        return acc;
    };
    const sortedFields = $view?.table.getSorters()
        .reduce(sortEntry, {} as Record<string, SortDirection>);
    const headerFilter = $view?.table.getHeaderFilters()
        .reduce(filterEntry, {} as Record<string, string>);

    const filterListValues = (col: ColumnDefinition) => 
        col.headerFilter === 'list' && col.headerFilterFuncParams?.values as string[];

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
        headerFilter[column] = value;
        if (value === undefined) {
            delete headerFilter[value];
        }

        $view?.table.setHeaderFilterValue(column, value);
    }

    function showPopupMenu(event: CustomEvent<MouseEvent>, field: string) {
        event.preventDefault();
        menus[field].showPopupMenu(event.detail);
    }

</script>

<section class="menu">
    <div class="options">
        {#each columns ?? [] as col}
            <p>
                <Switch title="{ $t('menu.table.show-hide') } {col.title}"
                    state={col.visible !== false}
                    on:toggle={() => $view?.table.getColumn(col.field).toggle()}>
                    <i class="bx bx-show"></i> 
                </Switch>
                <Switch title="{ $t('menu.table.group-by') } {col.title}"
                    state={$view?.groups.includes(col.field)}
                    on:toggle={() => $view?.toggleGroup(col.field)}>
                    <i class="bx bx-collection bx-flip-vertical"></i> 
                </Switch>
                <Switch title="{ $t('menu.table.sort-by') } {col.title}"
                    state={sortedFields[col.field] ?? null}
                    options={[null, 'asc', 'desc']}
                    on:toggle={({ detail }) => sortBy(col.field, detail)}>
                    <i class="bx {sortedFields[col.field] ?? 'asc'}"></i>
                </Switch>
                {#if col.headerFilter === 'tickCross'}
                    <Switch title="{ $t('menu.table.filter-by') } {col.title}"
                        state={headerFilter[col.field] ?? undefined}
                        options={[undefined, true, false]}
                        on:toggle={({ detail }) => filterBy(col.field, detail)}>
                        <i class="bx bx-filter-alt"></i>
                    </Switch>
                {:else if filterListValues(col)}
                    <Switch title="{ $t('menu.table.filter-by') } {col.title}"
                        state={!!headerFilter[col.field]}
                        on:click={(event) => showPopupMenu(event, col.field)}>
                        <i class="bx bx-filter-alt"></i>
                    </Switch>
                    <PopupMenu bind:this={menus[col.field]}>
                        <div class="values">
                            <button class="empty" on:click={() => filterBy(col.field, undefined)}>
                                &lt; { $t('table.filter.empty') } {col.title} &gt;
                            </button>
                            {#each filterListValues(col) as value}
                                <button on:click={() => filterBy(col.field, value)}>
                                    <i class="{col.field} {value}"></i> { $t(`songs.${col.field}.${value}`) }
                                </button>
                            {/each}
                        </div>
                    </PopupMenu>
                {/if}
                <span class="{!!headerFilter[col.field] ? 'active' : ''}">
                    {col.title}
                </span>
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

            span.active {
                color: var(--primary);
                font-weight: 500;
            }
        }

        div.values {
            display: flex;
            flex-direction: column;
            
            button {
                border: 0;
                border-radius: 0;
                color: var(--text);
                padding: 6px 20px 6px 12px;
                text-align: left;
                font-weight: normal;
                transition: all .2s ease-in-out;

                &.empty {
                    color: gray;
                    text-align: center;
                    font-style: italic;
                }

                &:hover {
                    background-color: white;
                }

                i.status {
                    display: inline-block;
                    width: 1.6em;
                }
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