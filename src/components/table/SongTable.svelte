<script lang="ts">
    import '../../styles/table.css';
    import { onMount } from 'svelte';
    import Menu from '@smui/menu';
    import List, { Item, Text } from '@smui/list';
    import Button, { Group } from '@smui/button';
    import type { TabulatorFull as Tabulator, ColumnDefinition } from 'tabulator-tables';
    import { column, comboBoxEditor } from './column.helper';
    import { autoFilter, rangeFilter } from './filter.helper';
    import { favColumn, statusFormatter, genreFormatter, labelFormatter, progressFormatter } from './formatter.helper';
    import Table from './Table.svelte'
    import FileDrop from './FileDrop.svelte';
    import Snackbar from '../Snackbar.svelte';
    import type { Song } from '../../model/song.model';
    import type { Observable } from 'rxjs';
    import { songs } from '../../store/song.store';

    let snackbar: Snackbar;
    let exportMenu: Menu;
    let table: Observable<Tabulator>;

    // https://tabulator.info/docs/5.4/edit#editor-list
    const columns: ColumnDefinition[] = [
      column("✩", "fav", "4%", undefined, favColumn),
      column("?", "status", "4%", "string", autoFilter(), statusFormatter),
      column("Progress", "progress", "14%", "number", rangeFilter(), progressFormatter),
      column("Title", "title", "25%", "string", autoFilter(), { editor: 'input' }),
      column("Artist", "artist", "25%", "string", autoFilter(), comboBoxEditor),
      column("Genre", "genre", "14%", "string", autoFilter(), genreFormatter, comboBoxEditor),
      column("Labels", "tags", "14%", "string", autoFilter(), labelFormatter, { editor: 'input' }),
      column("Learned", "learnedOn", "14%", "date", autoFilter(), { editor: 'input' }),
    ];

    onMount(async () => {
      const darkTheme = window?.matchMedia?.('(prefers-color-scheme:dark)')?.matches;
      if (darkTheme) {
        await import('tabulator-tables/dist/css/tabulator_midnight.min.css');
      } else {
        await import('tabulator-tables/dist/css/tabulator_bulma.min.css');
      }
    });

    const newSong = (): Song => ({ status: 'todo', progress: 0, tags: [] } as Song);
        
    function importJSON(data: string) {
      const json = JSON.parse(data) as Song[];
      if (json) {
        for(const song of json) {
          songs.replace(song, (s) => `${s.artist}${s.title}`);
        }
        snackbar.open(`Found ${json.length} songs. Total songs: ${songs.length}`);
      }
    }

    $: {
      if ($table) {
        $table.replaceData($songs);
      }
    }
</script>

<div>
  <div id="export-menu">
    <Group>
      <Button title="add row before" variant="raised" color="secondary" on:click={() => songs.unshift(newSong())}>+[]</Button>
      <Button title="add row after" variant="raised" color="secondary" on:click={() => songs.push(newSong())}>[]+</Button>
    </Group>
    <Button title="export table data" variant="raised" color="secondary" on:click={() => exportMenu.setOpen(true)}>Export</Button>
    <Menu bind:this={exportMenu}>
      <List>
        <Item on:SMUI:action={() => ($table.download("csv", "songs.csv", { delimiter: ";" }))}>
          <Text>CSV</Text>
        </Item>
        <Item on:SMUI:action={() => ($table.download("json", "songs.json"))}>
          <Text>JSON</Text>
        </Item>
        <Item on:SMUI:action={() => ($table.download("xlsx", "songs.xlsx", { sheetName: "My song repertoire" }))}>
          <Text>XLSX</Text>
        </Item>
        <Item on:SMUI:action={() => ($table.download("pdf", "songs.pdf", { title: "My song repertoire" }))}>
          <Text>PDF</Text>
        </Item>
      </List>
    </Menu>
  </div>
  
  <FileDrop on:addJson="{({ detail }) => importJSON(detail)}">
    <Table bind:element={table} {columns} />
  </FileDrop>
  
  <Snackbar bind:this={snackbar} />
</div>

<style>
    div {
        margin: 4px;
    }

    div#export-menu {
      display: inline-block;
      min-width: 100px;
    }
</style>
  