<script lang="ts">
  import 'tabulator-tables/dist/css/tabulator_bulma.min.css';
  import '../../styles/table.scss';
  import type { ColumnDefinition, CellComponent, CellEditEventCallback } from 'tabulator-tables';
  import { column, comboBoxEditor } from './templates/column.helper';
  import { autoFilter, rangeFilter } from './templates/filter.helper';
  import format from './templates/formatters/formatter.helper';
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
  let statusFormatter: (cell: CellComponent)  => string;

  const genreSelector = comboBoxEditor(genres.map(v => v.name));
  const interaction = {
    cellEdited: updateHandler()
  };

  // https://tabulator.info/docs/5.4/edit#editor-list
  const columns: ColumnDefinition[] = [
    column("Favorite", "fav", "50", undefined, format.favColumn, { cellEdited: updateHandler(), responsive: 3 }),
    column("Σ", "progressLogs", "50", "array", format.length, { hozAlign: 'right', headerFilter: 'number', responsive: 9, visible: false }),
    column("Status", "status", "50", "string", autoFilter(), { hozAlign: 'center', formatter: (cell) => statusFormatter(cell), cellEdited: updateHandler(), responsive: 1 }),
    column("Progress", "progress", "136", "number", rangeFilter(), format.progress, { cellEdited: updateHandler(), responsive: 2 }),
    column("📷", "artistImg", "30", undefined, format.bgImg, { responsive: 9 }),
    column("Artist", "artist", "200", "string", autoFilter(), comboBoxEditor(), interaction, { validator: 'required', responsive: 0 }),
    column("Title", "title", "200", "string", autoFilter(), interaction, { editor: 'input', validator: 'required', responsive: 0 }),
    column("Genre", "genre", "136", "string", autoFilter(), format.genre, genreSelector, interaction, { responsive: 2 }),
    column("Style", "style", "136", "string", autoFilter(), comboBoxEditor(), interaction, { responsive: 2 }),
    column("Source", "source", "200", "string", autoFilter(), format.marked, interaction, { editor: 'input', responsive: 9 }),
    column("Resource", "uri", "200", "string", autoFilter(), format.url, interaction, { editor: 'input', responsive: 9 }),
    column("Key", "key", "80", "string", autoFilter(), interaction, { editor: 'input', responsive: 9 }),
    column("Time", "time", "80", "string", autoFilter(), interaction, { editor: 'input', responsive: 9 }),
    column("BPM", "bpm", "80", "string", autoFilter(), interaction, { editor: 'input', responsive: 9 }),
    column("Level", "difficulty", "50", "number", format.difficulty, interaction, { responsive: 5 }),
    column("Features", "features", "200", "string", autoFilter(), format.label, interaction, { editor: 'input', responsive: 9 }),
    column("Labels", "tags", "200", "string", autoFilter(), format.label, interaction, { editor: 'input', responsive: 9 }),
    column("Learned", "learnedOn", "136", "date", autoFilter(), format.timestamp, interaction, { editor: 'date', responsive: 9 }),
    column("Last", "changedAt", "136", "date", autoFilter(), format.timestamp, { responsive: 9 }),
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
</script>

<main> 
  <StatusElement bind:statusFormatter on:delete={({ detail }) => deleteRow(detail)}/>

  <FileDrop on:enter={() => showInfo('Start importing...')} on:addJson={({ detail }) => importJSON(detail)}>
    <Table {columns}
      data={songs}
      idField='id'
      placeholder='No songs added.'
      exportTitle='My Song List'
      persistenceID='songs'
      groupHeader={format.groupBy}
      on:error={({ detail }) => showError(detail)}
    />
  </FileDrop>
</main>

<footer>
  <AddEntry />
</footer>

<style lang="scss">
  footer {
    position: sticky;
    bottom: calc(48px + 1rem);
    margin-left: 1rem;
    z-index: 20;
    height: 0;
    text-align: left;
  }
 
</style>