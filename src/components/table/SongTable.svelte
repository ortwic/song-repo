<script lang="ts">
    import '../../styles/table.scss';
    import { onMount } from 'svelte';
    import type { ColumnDefinition, CellComponent } from 'tabulator-tables';
    import { column, comboBoxEditor } from './column.helper';
    import { autoFilter, rangeFilter } from './filter.helper';
    import { favColumn, statusFormatter, genreFormatter, labelFormatter, progressFormatter, timestampFormatter, groupByFormatter } from './formatter.helper';
    import Table from './Table.svelte'
    import FileDrop from './FileDrop.svelte';
    import Snackbar from '../Snackbar.svelte';
    import SongService from '../../service/song.service';
    import { currentUser } from '../../service/auth.service';
    import type { UserSong } from '../../model/song.model';
    import { usersongs } from '../../store/song.store';
    import genres from '../../data/genres.json';
    import samples from '../../data/samples.json';

    const demosamples = samples as unknown as UserSong[];
    let service = new SongService();
    let snackbar: Snackbar;
    let table: Table;

    const genreSelector = comboBoxEditor(Object.keys(genres));

    // https://tabulator.info/docs/5.4/edit#editor-list
    const columns: ColumnDefinition[] = [
      column("Favorite", "fav", "50", undefined, favColumn, { cellEdited }),
      column("Status", "status", "50", "string", autoFilter(), statusFormatter),
      column("Progress", "progress", "14%", "number", rangeFilter(), progressFormatter, { cellEdited }),
      column("Genre", "genre", "13%", "string", autoFilter(), genreFormatter, genreSelector, { cellEdited }),
      column("Style", "style", "13%", "string", autoFilter(), comboBoxEditor(), { cellEdited }),
      column("Artist", "artist", "25%", "string", autoFilter(), comboBoxEditor(), { cellEdited }),
      column("Title", "title", "25%", "string", autoFilter(), { editor: 'input', cellEdited }),
      column("Source", "source", "25%", "string", autoFilter(), { editor: 'input', cellEdited }),
      column("Labels", "tags", "14%", "string", autoFilter(), labelFormatter, { editor: 'input', cellEdited }),
      column("Learned", "createdAt", "14%", "date", autoFilter(), timestampFormatter, { editor: 'date', cellEdited }),
      { title: "id", field: "id", visible: false },
      { title: "uid", field: "uid", visible: false },
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

    async function deleteRow(song: UserSong): Promise<void> {
      return service.deleteSong(song);
    }
    
    async function importJSON(data: string) {
      const result = await service.importSongs(JSON.parse(data));
      snackbar.open(`Found ${result.length} songs. Total songs: ${usersongs.length}`);
    }

    function showSamples() {
      usersongs.set(demosamples);
      if (!table.isGroupedBy('genre')) {
        table.toggleGroup('genre');
      }
    }
  
    $: if (table) {
      table.setData($usersongs);
      console.log(`Set ${$usersongs.length} entries.`);
    }
</script>

<svelte:head>
  <script async type="text/javascript" src="https://oss.sheetjs.com/sheetjs/xlsx.full.min.js"></script>
  <script async type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.5/jspdf.min.js"></script>
  <script async type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/2.3.2/jspdf.plugin.autotable.js"></script>
</svelte:head>
 
<FileDrop on:enter={() => snackbar.open('Start importing...')} on:addJson={({ detail }) => importJSON(detail)}>
  <Table bind:this={table} {columns} 
    placeholder='No songs added.' 
    exportTitle='My song repertoire'
    groupHeader={groupByFormatter}
    on:error={({ detail }) => snackbar.error(detail)}
    on:deleteRow={({ detail }) => deleteRow(detail)}
  />
</FileDrop>
<section class="footer">
  {#if !$currentUser}
    <a href="#/" role="button" title="Load some random demo samples"
      on:click|preventDefault={showSamples}><i>Samples</i></a>
  {/if}
  <button class="primary icon" title="add row after" on:click={() => usersongs.push(service.newSong())}>+</button>
</section>

<Snackbar bind:this={snackbar} />

<style lang="scss">
  section.footer {
    position: sticky;
    margin-right: .2rem;
    bottom: calc(48px + .4rem);
    z-index: 1;
    height: 0;
    text-align: right;
  }

  section.footer  {
    button.icon {
      font-size: 1.6rem;
    }
  }
</style>
  