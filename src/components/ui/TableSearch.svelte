<script lang="ts">
    import type { Filter } from "tabulator-tables";
    import { tableContext } from "../table/table.svelte";

    interface Props {
        placeholder?: string;
    }

    let {
        placeholder = ''
    }: Props = $props();

    let searchTerm = $state('');

    $effect(() => {
        if (tableContext.table) {
            const array = tableContext.table.getFilters(false)[0] as unknown as Filter[];
            searchTerm = array?.filter((f) => f.value)[0]?.value;
        }
    });

    function search(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
        const value = event.currentTarget.value;
        if (value) {
            tableContext.table.clearHeaderFilter();
            const columns = tableContext.table.getColumnDefinitions();

            // 2nd level array enforces OR comparison
            tableContext.table.setFilter([
                columns
                    .filter((c) => c.sorter === 'string')
                    .map((c) => ({ field: c.field, type: 'like', value })),
            ]);
        } else {
            tableContext.table.clearFilter(false);
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