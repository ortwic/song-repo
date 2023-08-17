<script lang="ts">
  import 'tabulator-tables/dist/css/tabulator_bulma.min.css';
  import '../../styles/table.scss';
  import type { ColumnDefinition, CellComponent, CellEditEventCallback } from 'tabulator-tables';
  import { column, comboBoxEditor } from './templates/column.helper';
  import { autoFilter, rangeFilter } from './templates/filter.helper';
  import format from './templates/formatter.helper';
  import StatusElement from './templates/StatusElement.svelte';
  import Table from './Table.svelte'
  import AddEntry from './AddEntry.svelte';
  import FileDrop from './FileDrop.svelte';
  import SongService from '../../service/song.service';
  import type { UserSong } from '../../model/song.model';
  import { showError, showInfo } from '../../store/notification.store';
  import genres from '../../data/genres.json';

  export let params: { id?: string } = {};

  const service = new SongService(params.id?.slice(1));
  const songs = service.usersongs;
  let table: Table;
  let statusFormatter: (cell: CellComponent)  => string;

  const genreSelector = comboBoxEditor(genres.map(v => v.name));

  // https://tabulator.info/docs/5.4/edit#editor-list
  const columns: ColumnDefinition[] = [
    column("Favorite", "fav", "50", undefined, format.favColumn, { cellEdited: updateHandler() }),
    column("Count", "progressLogs", "50", "array", format.length, { hozAlign: 'right', headerFilter: 'number' }),
    column("Progress", "progress", "136", "number", rangeFilter(), format.progress, { cellEdited: updateHandler() }),
    column("Status", "status", "50", "string", autoFilter(), { hozAlign: 'center', formatter: (cell) => statusFormatter(cell), cellEdited: updateHandler() }),
    column("▩", "artistImg", "30", undefined, format.bgImg),
    column("Artist", "artist", "200", "string", autoFilter(), comboBoxEditor(), { validator: 'required', cellEdited: updateHandler() }),
    column("Title", "title", "200", "string", autoFilter(), { editor: 'input', validator: 'required', cellEdited: updateHandler() }),
    column("Genre", "genre", "136", "string", autoFilter(), format.genre, genreSelector, { cellEdited: updateHandler() }),
    column("Style", "style", "136", "string", autoFilter(), comboBoxEditor(), { cellEdited: updateHandler() }),
    column("Source", "source", "200", "string", autoFilter(), format.marked, { editor: 'input', cellEdited: updateHandler() }),
    column("Key", "key", "80", "string", autoFilter(), { editor: 'input', cellEdited: updateHandler() }),
    column("Time", "time", "80", "string", autoFilter(), { editor: 'input', cellEdited: updateHandler() }),
    column("BPM", "bpm", "80", "string", autoFilter(), { editor: 'input', cellEdited: updateHandler() }),
    column("Level", "difficulty", "50", "number", format.difficulty, { cellEdited: updateHandler() }),
    column("Features", "features", "200", "string", autoFilter(), format.label, { editor: 'input', cellEdited: updateHandler() }),
    column("Labels", "tags", "200", "string", autoFilter(), format.label, { editor: 'input', cellEdited: updateHandler() }),
    column("Learned", "learnedOn", "136", "date", autoFilter(), format.timestamp, { editor: 'date', cellEdited: updateHandler() }),
    column("Last", "changedAt", "136", "date", autoFilter(), format.timestamp),
    { title: "id", field: "id", visible: false },
  ];

  function updateHandler(): CellEditEventCallback {
    return async (cell: CellComponent): Promise<void> => {
      try {
        await service.setSong(cell.getData() as UserSong);
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
      showInfo(`Found ${result.length} songs. Total songs: ${$songs.length}`);
    } catch (error) {
      showError(error.message);
    }
  }

  $: if (table) {
    table.setData($songs, 'id');
  }
</script>

<main> 
  <StatusElement bind:statusFormatter on:delete={({ detail }) => deleteRow(detail)}/>

  <FileDrop on:enter={() => showInfo('Start importing...')} on:addJson={({ detail }) => importJSON(detail)}>
    <Table bind:this={table} {columns}
      placeholder='No songs added.'
      exportTitle='My Song List'
      groupHeader={format.groupBy}
      on:error={({ detail }) => showError(detail)}
    />
  </FileDrop>
</main>

<footer>
  <AddEntry />
</footer>

<style>
  footer {
    position: sticky;
    bottom: calc(48px + 1rem);
    margin-right: 1rem;
    z-index: 20;
    height: 0;
    text-align: right;
  }
 
</style>