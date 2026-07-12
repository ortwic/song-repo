<script lang="ts">
    import type { Filter } from "tabulator-tables";
    import { type TableView, tableView } from "../../store/app.store";
    import { onMount } from "svelte";

    interface Props {
        placeholder?: string;
    }

    let {
        placeholder = ''
    }: Props = $props();

    let searchTerm = $state('');

    onMount(() => tableView.subscribe(initSearch));

    function initSearch(view: TableView) {
        if (view) {
            const array = view.table.getFilters(false)[0] as unknown as Filter[];
            searchTerm = array?.filter((f) => f.value)[0]?.value;
        }
    }

    function search(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
        const value = event.currentTarget.value;
        if (value) {
            $tableView.table.clearHeaderFilter();

            const columns = $tableView.table.getColumnDefinitions();

            // 2nd level array enforces OR comparison
            $tableView.table.setFilter([
                columns
                    .filter((c) => c.sorter === 'string')
                    .map((c) => ({ field: c.field, type: 'like', value })),
            ]);
        } else {
            $tableView.table.clearFilter(false);
        }
    }
</script>

<div class="section">
    <input
        class="input"
        type="search"
        {placeholder}
        autocomplete="off"
        value={searchTerm}
        oninput={search}
    />
</div>

<style lang="scss">
    input[type='search'] {
        width: 100%;
    }
</style>