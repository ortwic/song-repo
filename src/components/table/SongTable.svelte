<script lang="ts">
    import '../../styles/table.scss';
    import { onMount } from 'svelte';
    import { portal } from 'svelte-portal';
    import type { ColumnDefinition, CellComponent, CellEditEventCallback, RowComponent } from 'tabulator-tables';
    import { column, comboBoxEditor } from './templates/column.helper';
    import { autoFilter, rangeFilter } from './templates/filter.helper';
    import format from './templates/formatter.helper';
    import StatusElement from './templates/StatusElement.svelte';
    import Table from './Table.svelte'
    import FileDrop from './FileDrop.svelte';
    import AddButton from '../ui/AddButton.svelte';
    import SongService, { samples } from '../../service/song.service';
    import type { UserSong } from '../../model/song.model';
    import { showError, showInfo, showWarn } from '../../store/notification.store';
    import { usersongs } from '../../store/song.store';
    import genres from '../../data/genres.json';
    let service = new SongService();
    let table: Table;
    let currentRow: RowComponent;
    let statusFormatter: (cell: CellComponent)  => string;

    const genreSelector = comboBoxEditor(genres.map(v => v.name));

    // https://tabulator.info/docs/5.4/edit#editor-list
    const columns: ColumnDefinition[] = [
      column("Favorite", "fav", "50", undefined, format.favColumn, { cellEdited: updateHandler() }),
      column("Count", "progressLogs", "50", "array", format.length, { hozAlign: 'right', headerFilter: 'number' }),
      column("Progress", "progress", "136", "number", rangeFilter(), format.progress, { cellEdited: updateHandler() }),
      column("Status", "status", "50", "string", autoFilter(), { hozAlign: 'center', formatter: (cell) => statusFormatter(cell), cellEdited: updateHandler() }),
      column("Level", "difficulty", "50", "number", autoFilter(), { editor: 'input', cellEdited: updateHandler() }),
      column("Title", "title", "200", "string", autoFilter(), { editor: 'input', validator: 'required', cellEdited: updateHandler() }),
      column("Artist", "artist", "200", "string", autoFilter(), comboBoxEditor(), { validator: 'required', cellEdited: updateHandler('title') }),
      column("Genre", "genre", "136", "string", autoFilter(), format.genre, genreSelector, { cellEdited: updateHandler('style') }),
      column("Style", "style", "136", "string", autoFilter(), comboBoxEditor(), { cellEdited: updateHandler('artist') }),
      column("Source", "source", "200", "string", autoFilter(), format.marked, { editor: 'input', cellEdited: updateHandler() }),
      column("Key", "key", "80", "string", autoFilter(), { editor: 'input', cellEdited: updateHandler() }),
      column("Time", "time", "80", "string", autoFilter(), { editor: 'input', cellEdited: updateHandler() }),
      column("BPM", "bpm", "80", "string", autoFilter(), { editor: 'input', cellEdited: updateHandler() }),
      column("Features", "features", "200", "string", autoFilter(), format.label, { editor: 'input', cellEdited: updateHandler() }),
      column("Labels", "tags", "200", "string", autoFilter(), format.label, { editor: 'input', cellEdited: updateHandler() }),
      column("Learned", "learnedOn", "136", "date", autoFilter(), format.timestamp, { editor: 'date', cellEdited: updateHandler() }),
      column("Last", "changedAt", "136", "date", autoFilter(), format.timestamp),
      { title: "id", field: "id", visible: false },
    ];

    onMount(async () => {
      // const darkTheme = window?.matchMedia?.('(prefers-color-scheme:dark)')?.matches;
      // if (darkTheme) {
      //   await import('tabulator-tables/dist/css/tabulator_midnight.min.css');
      // } else {
        await import('tabulator-tables/dist/css/tabulator_bulma.min.css');
      // }
      
      window.addEventListener('popstate', loadSamples);
      loadSamples();
    });
    
    function loadSamples(): void {
      if (!service.hasUser()) {
        usersongs.set(location.href.endsWith('samples') ? $samples : []);
      }
    }

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

<StatusElement bind:statusFormatter on:delete={({ detail }) => deleteRow(detail)}/>

<FileDrop on:enter={() => showInfo('Start importing...')} on:addJson={({ detail }) => importJSON(detail)}>
  <Table bind:this={table} {columns}
    placeholder='No songs added.'
    exportTitle='My Song Repertory'
    groupHeader={format.groupBy}
    on:error={({ detail }) => showError(detail)}
  />
</FileDrop>

{#if !service.isShared()}
<div use:portal class="footer" hidden>
  <AddButton title="add row after" on:click={addRow}/>
</div>
{/if}

<style lang="scss">
  div.footer {
    position: sticky;
    bottom: calc(48px + 1rem);
    margin-right: 1rem;
    z-index: 20;
    height: 0;
    text-align: right;
  }
</style>
  