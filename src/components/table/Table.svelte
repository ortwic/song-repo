<script lang="ts">
    import 'tabulator-tables/dist/css/tabulator_bulma.min.css';
    import { TabulatorFull, type ColumnDefinition, type DownloadOptions, type DownloadType } from 'tabulator-tables';
    import { onMount } from 'svelte';
    import { Observable, fromEvent, map, take } from 'rxjs';

    export let columns: ColumnDefinition[];
    export let placeholder = '';
    let table: Observable<TabulatorFull>;
    let tableContainer: HTMLElement;

    onMount(() => {
      const tableInstance = new TabulatorFull(tableContainer, {
        columns,
        placeholder,
        index: 'id',
        clipboard: true,
        movableColumns: true,
        pagination: false,
        footerElement: '#footer',
        persistence:{
          sort:true,
          filter:true,
          columns:true,
        },
        locale: 'en-us',
        langs: {
          'en-us': {
            pagination: {
              'page_size': '',
              'first': '<<',
              'last': '>>',
              'prev': '<',
              'next': '>',
            }
          }
        }
      });

      table = fromEvent(tableInstance, 'tableBuilt').pipe(take(1), map(() => tableInstance));
    });

    export async function setData<T>(data: T): Promise<void> {
      if ($table) {
        return $table.setData(data);
      }      
    }

    export async function download(downloadType: DownloadType, filename: string, params?: DownloadOptions): Promise<void> {
      if ($table) {
        return $table.download(downloadType, `${filename}.${downloadType}`, params);
      }      
    }
</script>

<div id="table" bind:this={tableContainer}>
</div>
<span id="footer">
  <slot name="footer"></slot>
</span>

<style>
    #table {
      overflow: auto;
      width: 100%;
      height: 100%;
      max-height: 100%;
      overflow: hidden;
    }

    #footer {
      width: 100%;
    }

    :global(span.tabulator-paginator) {
      float: right;
      padding: 10px;
    }
</style>
  