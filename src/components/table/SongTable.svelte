<script lang="ts">
    import '../../styles/table.css';
    import { onMount } from 'svelte';
    import Menu from '@smui/menu';
    import List, { Item, Text } from '@smui/list';
    import Button, { Group } from '@smui/button';
    import type { Observable } from 'rxjs';
    import type { TabulatorFull as Tabulator, ColumnDefinition, CellComponent } from 'tabulator-tables';
    import { column, comboBoxEditor } from './column.helper';
    import { autoFilter, rangeFilter } from './filter.helper';
    import { favColumn, statusFormatter, genreFormatter, labelFormatter, progressFormatter } from './formatter.helper';
    import Table from './Table.svelte'
    import FileDrop from './FileDrop.svelte';
    import Snackbar from '../Snackbar.svelte';
    import SongService, { newSong } from '../../service/song.service';
    import { usersongs } from '../../store/song.store';
    import genres from '../../data/genres.json';

    let service = new SongService();
    let snackbar: Snackbar;
    let exportMenu: Menu;
    let table: Observable<Tabulator>;

    const genreSelector = comboBoxEditor(Object.keys(genres));

    // https://tabulator.info/docs/5.4/edit#editor-list
    const columns: ColumnDefinition[] = [
      { title: "id", field: "id", visible: false },
      { title: "uid", field: "uid", visible: false },
      column("✩", "fav", "4%", undefined, favColumn, { cellEdited }),
      column("?", "status", "4%", "string", autoFilter(), statusFormatter),
      column("Progress", "progress", "14%", "number", rangeFilter(), progressFormatter, { cellEdited }),
      column("Genre", "genre", "14%", "string", autoFilter(), genreFormatter, genreSelector, { cellEdited }),
      column("Style", "style", "25%", "string", autoFilter(), genreFormatter, comboBoxEditor(), { cellEdited }),
      column("Artist", "artist", "25%", "string", autoFilter(), comboBoxEditor(), { cellEdited }),
      column("Title", "title", "25%", "string", autoFilter(), { editor: 'input', cellEdited }),
      column("Labels", "tags", "14%", "string", autoFilter(), labelFormatter, { editor: 'input', cellEdited }),
      column("Learned", "learnedOn", "14%", "date", autoFilter(), { editor: 'input', cellEdited }),
    ];

    onMount(async () => {
      const darkTheme = window?.matchMedia?.('(prefers-color-scheme:dark)')?.matches;
      if (darkTheme) {
        await import('tabulator-tables/dist/css/tabulator_midnight.min.css');
      } else {
        await import('tabulator-tables/dist/css/tabulator_bulma.min.css');
      }
    });
    
    function cellEdited(cell: CellComponent) {
      return service.setSong(cell.getData());
    }
    
    function importJSON(data: string) {
      const result = service.importSongs(JSON.parse(data));
      snackbar.open(`Found ${result.length} songs. Total songs: ${usersongs.length}`);
    }

    function downloadXlsx() {
      // TODO load sheetjs scripts async
      $table.download("xlsx", "songs.xlsx", { sheetName: "My song repertoire" });
    }

    function downloadPdf() {
      // TODO load jspdf scripts async
      $table.download("pdf", "songs.pdf", { title: "My song repertoire" });
    }

    $: {
      if ($table) {
        $table.replaceData($usersongs);
      }
    }
</script>

<svelte:head>
  <script type="text/javascript" src="https://oss.sheetjs.com/sheetjs/xlsx.full.min.js"></script>
  <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.5/jspdf.min.js"></script>
  <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/2.3.2/jspdf.plugin.autotable.js"></script>
</svelte:head>

<div>
  <div id="export-menu">
    <Group>
      <Button title="add row before" variant="raised" color="secondary" on:click={() => usersongs.unshift(newSong())}>+[]</Button>
      <Button title="add row after" variant="raised" color="secondary" on:click={() => usersongs.push(newSong())}>[]+</Button>
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
        <Item on:SMUI:action={downloadXlsx}>
          <Text>XLSX</Text>
        </Item>
        <Item on:SMUI:action={downloadPdf}>
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
  