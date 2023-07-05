<script lang="ts">
    import '../../styles/table.css';
    import { onMount } from 'svelte';
    import type { ColumnDefinition, CellComponent } from 'tabulator-tables';
    import { column, comboBoxEditor } from './column.helper';
    import { autoFilter, rangeFilter } from './filter.helper';
    import { favColumn, statusFormatter, genreFormatter, labelFormatter, progressFormatter, timestampFormatter } from './formatter.helper';
    import Table from './Table.svelte'
    import FileDrop from './FileDrop.svelte';
    import Snackbar from '../Snackbar.svelte';
    import SongService from '../../service/song.service';
    import { currentUser } from '../../service/auth.service';
    import type { UserSong } from '../../model/song.model';
    import { usersongs } from '../../store/song.store';
    import genres from '../../data/genres.json';

    let service = new SongService();
    let snackbar: Snackbar;
    let table: Table;

    const genreSelector = comboBoxEditor(Object.keys(genres));

    // https://tabulator.info/docs/5.4/edit#editor-list
    const columns: ColumnDefinition[] = [
      { title: "id", field: "id", visible: false },
      { title: "uid", field: "uid", visible: false },
      column("", "fav", "4%", undefined, favColumn, { cellEdited }),
      column("", "status", "4%", "string", autoFilter(), statusFormatter),
      column("Progress", "progress", "14%", "number", rangeFilter(), progressFormatter, { cellEdited }),
      column("Genre", "genre", "14%", "string", autoFilter(), genreFormatter, genreSelector, { cellEdited }),
      column("Style", "style", "14%", "string", autoFilter(), genreFormatter, comboBoxEditor(), { cellEdited }),
      column("Artist", "artist", "25%", "string", autoFilter(), comboBoxEditor(), { cellEdited }),
      column("Title", "title", "25%", "string", autoFilter(), { editor: 'input', cellEdited }),
      column("Labels", "tags", "14%", "string", autoFilter(), labelFormatter, { editor: 'input', cellEdited }),
      column("Learned", "createdAt", "14%", "date", autoFilter(), timestampFormatter, { editor: 'date', cellEdited }),
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
      return service.setSong(cell.getData() as UserSong);
    }
    
    function importJSON(data: string) {
      const result = service.importSongs(JSON.parse(data));
      snackbar.open(`Found ${result.length} songs. Total songs: ${usersongs.length}`);
    }

    function downloadXlsx() {
      try {
        table.download("xlsx", "songs.xlsx", { sheetName: "My song repertoire" });
      } catch (error) {
        snackbar.error(error.message)        
      }
    }

    function downloadPdf() {
      try {
        table.download("pdf", "songs.pdf", { title: "My song repertoire" });
      } catch (error) {
        snackbar.error(error.message)
      }
    }
  
    function demo() {
      usersongs.set([
        { id: "rock_piano_fried_chicken", uid: "0", title: "Fried Chicken", artist: "Jürgen Moser", status: 'todo', genre: 'Rock', tags: [], fav: false },
        { id: "p_pietschmann_interstellar", uid: "0", title: "Interstellar", artist: "Hans Zimmer / Pietschmann", status: 'wip', genre: 'Movie Score', progress: 60, tags: ["new"], fav: true },
        { id: "l_beethoven_fr_elisec", uid: "0", title: "Für Elise", artist: "L. Beethoven", status: 'done', genre: 'Classical', progress: 100, tags: [], fav: false },
        { id: "d_brubeck_take_5", uid: "0", title: "Take 5", artist: "Dave Brubeck", status: 'repeat', genre: "Jazz", progress: 80, tags: ["improv", "lead sheet"], fav: false },
      ]);
    }

    $: if (table) {
      table.setData($usersongs);
      console.log(`Set ${$usersongs.length} entries.`, $usersongs.map(s => s.title));
    }
</script>

<svelte:head>
  <script async type="text/javascript" src="https://oss.sheetjs.com/sheetjs/xlsx.full.min.js"></script>
  <script async type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.5/jspdf.min.js"></script>
  <script async type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/2.3.2/jspdf.plugin.autotable.js"></script>
</svelte:head>

<div>  
  <FileDrop on:enter={() => snackbar.open('Start importing...')} on:addJson={({ detail }) => importJSON(detail)}>
    <Table bind:this={table} {columns}>
      <span slot="placeholder">
        {#if !$usersongs.length}
          No songs added.<br />
          {#if !$currentUser}
              <a href="#/" role="button" title="Load some random samples"
                on:click|preventDefault={demo}>Load some demo samples.</a>
          {/if}
        {/if}
      </span>
      <span slot="footer">
        <button title="add row before" on:click={() => usersongs.unshift(service.newSong())}>+[]</button>
        <button title="add row after" on:click={() => usersongs.push(service.newSong())}>[]+</button>
        <ul>
          <li>
            <a href="#/" role="button" title="Download CSV"
              on:click|preventDefault={() => (table.download("csv", "songs", { delimiter: ";" }))}>CSV</a>
          </li>
          <li>
            <a href="#/" role="button" title="Download JSON"
              on:click|preventDefault={() => (table.download("json", "songs"))}>JSON</a>
          </li>
          <li>
            <a href="#/" role="button" title="Download XLSX"
              on:click|preventDefault={downloadXlsx}>XLSX</a>
          </li>
          <li>
            <a href="#/" role="button" title="Download PDF"
              on:click|preventDefault={downloadPdf}>PDF</a>
          </li>
        </ul>
      </span>
    </Table>
  </FileDrop>
  
  <Snackbar bind:this={snackbar} />
</div>

<style>
    div {
        margin: 4px;
    }

    ul {
      display: inline-block;
      padding: 0 .6rem;
      list-style: none;
    }

    ul li {
      display: inline-block;
    }

    ul li:not(:last-child)::after {
      content: '·';
      padding: 0 .4rem;
    }

    ul li a {
      font-weight: normal;
    }
</style>
  