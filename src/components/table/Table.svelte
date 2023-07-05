<script lang="ts">
    import 'tabulator-tables/dist/css/tabulator_bulma.min.css';
    import { TabulatorFull, type ColumnDefinition, type DownloadOptions, type DownloadType } from 'tabulator-tables';
    import { onMount } from 'svelte';
    import { Observable, fromEvent, map, take } from 'rxjs';

    export let columns: ColumnDefinition[];
    let element: Observable<TabulatorFull>;
    let tableComponent: HTMLElement;

    onMount(() => {
      const table = new TabulatorFull(tableComponent, {
        columns,
        index: 'id',
        placeholder: '',
        clipboard: true,
        movableColumns: true,
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

    export async function setData<T>(data: T): Promise<void> {
      if ($element) {
        return $element.setData(data);
      }      
    }

    export async function download(downloadType: DownloadType, filename: string, params?: DownloadOptions): Promise<void> {
      if ($element) {
        return $element.download(downloadType, `${filename}.${downloadType}`, params);
      }      
    }
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
  