<script lang="ts">
    import '../../styles/table.scss';
    import { onMount } from 'svelte';
    import type { ColumnDefinition, CellComponent, CellEditEventCallback, RowComponent } from 'tabulator-tables';
    import { column, comboBoxEditor } from './templates/column.helper';
    import { autoFilter, rangeFilter } from './templates/filter.helper';
    import format from './templates/formatter.helper';
    import Table from './Table.svelte'
    import FileDrop from './FileDrop.svelte';
    import AddButton from '../ui/AddButton.svelte';
    import SongService from '../../service/song.service';
    import type { UserSong } from '../../model/song.model';
    import { showError, showInfo, showWarn } from '../../store/notification.store';
    import { usersongs } from '../../store/song.store';
    import genres from '../../data/genres.json';
    
    let service = new SongService();
    let table: Table;
    let currentRow: RowComponent;

    const genreSelector = comboBoxEditor(genres.map(v => v.name));

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
      column("Key", "key", "90", "string", autoFilter(), { editor: 'input', cellEdited: updateHandler() }),
      column("Time", "time", "90", "string", autoFilter(), { editor: 'input', cellEdited: updateHandler() }),
      column("BPM", "bpm", "90", "string", autoFilter(), { editor: 'input', cellEdited: updateHandler() }),
      column("Features", "features", "14%", "string", autoFilter(), format.label, { editor: 'input', cellEdited: updateHandler() }),
      column("Labels", "tags", "14%", "string", autoFilter(), format.label, { editor: 'input', cellEdited: updateHandler() }),
      column("Learned", "learnedOn", "14%", "date", autoFilter(), format.timestamp, { editor: 'date', cellEdited: updateHandler() }),
      { title: "id", field: "id", visible: false },
    ];

    onMount(async () => {
      // const darkTheme = window?.matchMedia?.('(prefers-color-scheme:dark)')?.matches;
      // if (darkTheme) {
      //   await import('tabulator-tables/dist/css/tabulator_midnight.min.css');
      // } else {
        await import('tabulator-tables/dist/css/tabulator_bulma.min.css');
      // }
    });

    async function addRow(): Promise<void> {
      if (!service.hasUser()) {
        showWarn('You are not signed in, so data won\'t be persisted after leaving the app!', 12);
      }

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
          showError(error.message);
        }
      };
    }

    async function deleteRow(song: UserSong): Promise<void> {
      try {
        await service.deleteSong(song);
      } catch (error) {
        showError(error.message);
      }
    }
    
    async function importJSON(data: string): Promise<void> {
      try {
        const result = await service.importSongs(JSON.parse(data));
        showInfo(`Found ${result.length} songs. Total songs: ${usersongs.length}`);
      } catch (error) {
        showError(error.message);
      }
    }
  
    $: if (table) {
      table.setData($usersongs, 'id');
    }
</script>
 
<FileDrop on:enter={() => showInfo('Start importing...')} on:addJson={({ detail }) => importJSON(detail)}>
  <Table bind:this={table} {columns}
    placeholder='No songs added.' 
    exportTitle='My Song Repertory'
    groupHeader={format.groupBy}
    on:error={({ detail }) => showError(detail)}
    on:deleteRow={({ detail }) => deleteRow(detail)}
  />
</FileDrop>

{#if !service.isShared()}
<section class="footer">
  <AddButton title="add row after" on:click={addRow}/>
</section>
{/if}

<style lang="scss">
  section.footer {
    position: sticky;
    bottom: calc(48px + 1rem);
    margin-right: 1rem;
    z-index: 20;
    height: 0;
    text-align: right;
  }
</style>
  