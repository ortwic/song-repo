<script lang="ts">
    import 'tabulator-tables/dist/css/tabulator_bulma.min.css';
    import { TabulatorFull, type ColumnDefinition } from 'tabulator-tables';
    import { onMount } from 'svelte';
    import { Observable, fromEvent, map, take } from 'rxjs';

    export let columns: ColumnDefinition[];
    export let element: Observable<TabulatorFull>;
    let tableComponent: HTMLElement;

    onMount(() => {
      const table = new TabulatorFull(tableComponent, {
        columns,
        placeholder: '#placeholder',
        clipboard: true,
        movableColumns: true,
        reactiveData: true,
        pagination: true,
        paginationSize: 50,
        footerElement: '#footer',
        persistence:{
          sort:true,
          filter:true,
          columns:true,
        }
      });

      element = fromEvent(table, 'tableBuilt').pipe(take(1), map(() => table));
    });
</script>

<div id="table" bind:this={tableComponent}>
</div>
<p id="placeholder">
  <slot name="placeholder"></slot>
</p>
<span id="footer">
  <slot name="footer"></slot>
</span>

<style>
    #table {
      overflow: auto;
      max-height: 100%;
    }

    #placeholder {
      font-style: italic;
      text-align: center;
    }

    #footer {
      width: 100%;
    }

    :global(span.tabulator-paginator) {
      float: right;
      padding: 10px;
    }
</style>
  