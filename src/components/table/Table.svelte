<script lang="ts">
    import 'tabulator-tables/dist/css/tabulator_bulma.min.css';
    import Button, { Group } from '@smui/button';
    import { column, autoFilter, favColumn, comboBoxEditor, statusMutator, genreFormatter, labelFormatter, progressColumn } from './column.helper';
    import { TabulatorFull as Tabulator, type ColumnDefinition } from 'tabulator-tables';
    import { onMount } from 'svelte';
    import type { Song } from '../../model/song.model';
    import samples from '../../data/samples.json';

    export let data: Song[];  
    let table: Tabulator;
    let tableComponent: HTMLElement;

    // https://tabulator.info/docs/5.4/edit#editor-list
    const columns: ColumnDefinition[] = [
      column("✩", "fav", "4%", undefined, favColumn),
      column("?", "status", "4%", "string", autoFilter, { hozAlign: 'center', mutator: statusMutator }),
      column("Progress", "progress", "14%", "number", progressColumn, { editor: 'range' }),
      column("Title", "title", "25%", "string", autoFilter, { editor: 'input' }),
      column("Artist", "artist", "25%", "string", autoFilter, comboBoxEditor),
      column("Genre", "genre", "14%", "string", autoFilter, genreFormatter, comboBoxEditor),
      column("Labels", "tags", "14%", "string", autoFilter, labelFormatter, { editor: 'input' }),
      column("Learned", "learnedOn", "14%", "date", autoFilter, { editor: 'input' }),
    ];

    onMount(() => {
      table = new Tabulator(tableComponent, {
          columns,
          maxHeight: "100%",
          reactiveData: true,
          pagination: true,
          paginationSize: 50
      });
    });

    $: {
      if (table && data && data.length) {
        console.debug('set data', data);
        table.replaceData(data as Song[]);
      }
    }
</script>

<div>
  <Group>
    <Button variant="raised" color="secondary" on:click={() => table.replaceData(data)}>Source</Button>
    <Button variant="raised" color="secondary" on:click={() => table.replaceData(samples)}>Large Sample</Button>
  </Group>
  
  <div id="table" bind:this={tableComponent}></div>
</div>

<style>
    div {
        margin: 4px;
    }

    div#table {
      overflow: auto;
      max-height: 100%;
    }
</style>
  