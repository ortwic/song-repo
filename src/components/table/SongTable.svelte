<script lang="ts">
    import '../../styles/table.scss';
    import { onMount } from 'svelte';
    import type { ColumnDefinition, CellComponent, CellEditEventCallback, RowComponent } from 'tabulator-tables';
    import { column, comboBoxEditor } from './column.helper';
    import { autoFilter, rangeFilter } from './filter.helper';
    import format from './formatter.helper';
    import Table from './Table.svelte'
    import FileDrop from './FileDrop.svelte';
    import AddButton from '../ui/AddButton.svelte';
    import Snackbar from '../Snackbar.svelte';
    import SongService from '../../service/song.service';
    import { currentUser } from '../../service/auth.service';
    import type { UserSong } from '../../model/song.model';
    import { usersongs } from '../../store/song.store';
    import genres from '../../data/genres.json';
    
    let service = new SongService();
    let snackbar: Snackbar;
    let table: Table;
    let currentRow: RowComponent;

    const genreSelector = comboBoxEditor(Object.keys(genres));

    // https://tabulator.info/docs/5.4/edit#editor-list
    const columns: ColumnDefinition[] = [
      column("Favorite", "fav", "50", undefined, format.favColumn, { cellEdited: updateHandler() }),
      column("Status", "status", "50", "string", autoFilter(), format.status),
      column("Progress", "progress", "14%", "number", rangeFilter(), format.progress, { cellEdited: updateHandler() }),
      column("Genre", "genre", "13%", "string", autoFilter(), format.genre, genreSelector, { cellEdited: updateHandler('style') }),
      column("Style", "style", "13%", "string", autoFilter(), comboBoxEditor(), { cellEdited: updateHandler('artist') }),
      column("Artist", "artist", "25%", "string", autoFilter(), comboBoxEditor(), { validator: 'required', cellEdited: updateHandler('title') }),
      column("Title", "title", "25%", "string", autoFilter(), { editor: 'input', validator: 'required', cellEdited: updateHandler() }),
      column("Source", "source", "25%", "string", autoFilter(), format.marked, { editor: 'input', cellEdited: updateHandler() }),
      column("Labels", "tags", "14%", "string", autoFilter(), format.label, { editor: 'input', cellEdited: updateHandler() }),
      column("Learned", "learnedOn", "14%", "date", autoFilter(), format.timestamp, { editor: 'date', cellEdited: updateHandler() }),
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
      
      // for debugging only
      // if (import.meta.env.DEV) setTimeout(() => {if (!$currentUser) showSamples()}, 20);
    });

    async function addRow(): Promise<void> {
      currentRow = await table.addRow(service.newSong());
      await table.focusField(currentRow, 'genre');
    }
    
    function updateHandler(nextField?: keyof UserSong): CellEditEventCallback {
      return async (cell: CellComponent): Promise<void> => {
        try {
          const id = await service.setSong(cell.getData() as UserSong);

          if (!id && nextField && currentRow) {
            await table.focusField(currentRow, nextField);
          } 
          currentRow = undefined;
        } catch (error) {
          snackbar.error(error.message);
        }
      };
    }

    async function deleteRow(song: UserSong): Promise<void> {
      try {
        await service.deleteSong(song);
      } catch (error) {
        snackbar.error(error.message);
      }
    }
    
    async function importJSON(data: string): Promise<void> {
      try {
        const result = await service.importSongs(JSON.parse(data));
        snackbar.open(`Found ${result.length} songs. Total songs: ${usersongs.length}`);
      } catch (error) {
        snackbar.error(error.message);
      }
    }
  
    $: if (table) {
      table.setData($usersongs);
      console.debug('Σ', $usersongs.length);
    }
</script>

<svelte:head>
  <script async type="text/javascript" src="https://oss.sheetjs.com/sheetjs/xlsx.full.min.js"></script>
  <script async type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.5/jspdf.min.js"></script>
  <!-- <script async type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/2.3.2/jspdf.plugin.autotable.js"></script> -->
</svelte:head>
 
<FileDrop on:enter={() => snackbar.open('Start importing...')} on:addJson={({ detail }) => importJSON(detail)}>
  <Table bind:this={table} {columns}
    placeholder='No songs added.' 
    exportTitle='My song repertoire'
    groupHeader={format.groupBy}
    on:error={({ detail }) => snackbar.error(detail)}
    on:deleteRow={({ detail }) => deleteRow(detail)}
  />
</FileDrop>
<section class="footer">
  <AddButton title="add row after" on:click={addRow}/>
</section>

<Snackbar bind:this={snackbar} />

<style lang="scss">
  section.footer {
    position: sticky;
    bottom: calc(48px + 1rem);
    margin-right: 1rem;
    z-index: 10;
    height: 0;
    text-align: right;
  }
</style>
  