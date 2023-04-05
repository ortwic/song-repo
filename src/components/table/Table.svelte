<script lang="ts">
    import 'tabulator-tables/dist/css/tabulator_bulma.min.css';
    import Button, { Group } from '@smui/button';
    import { favFormatter, statusMutator, genreFormatter, progressFormatter } from './formatter.helper';
    import { TabulatorFull as Tabulator, type ColumnDefinition } from 'tabulator-tables';
    import {onMount} from 'svelte';
    import type { Item } from '../../model/types';
    import samples from '../../data/samples.json';
    
    export let data: Item[];
    let table: Tabulator;
    let tableComponent: HTMLElement;

    // https://tabulator.info/docs/5.4/edit#editor-list
    const columns: ColumnDefinition[] = [
      { title: "✩", field: "fav", width: "4%", hozAlign: 'center', sorter: "boolean", formatter: favFormatter },
      { title: "?", field: "status", width: "4%", hozAlign: 'center', sorter: "string", mutator: statusMutator },
      { title: "Progress", field: "progress", width: "14%", resizable: true, sorter: "number", formatter: 'progress', formatterParams: progressFormatter },
      { title: "Title", field: "title", width: "25%", resizable: true, sorter: "string", editor: true },
      { title: "Artist", field: "artist", width: "25%", resizable: true, sorter: "string", editor: true },
      { title: "Genre", field: "genre", width: "14%", resizable: true, sorter: "string", editor: true, formatter: genreFormatter },
      { title: "Learned", field: "learnedOn", width: "14%", resizable: true, sorter: "date", editor: true },
    ];

    onMount(() => {
        table = new Tabulator(tableComponent, {
          data,
          columns,
          reactiveData: true,
          pagination: true,
          paginationSize: 50
        });
    });

    function replaceData(data: unknown): void {
        table.replaceData(data as Item[]);
    }
</script>

<div>
  <Group>
    <Button variant="raised" color="secondary" on:click={() => replaceData(data)}>Small Sample</Button>
    <Button variant="raised" color="secondary" on:click={() => replaceData(samples)}>Large Sample</Button>
  </Group>
  
  <div bind:this={tableComponent}></div>
</div>

<style>
    div {
        margin: 4px;
    }
</style>
  