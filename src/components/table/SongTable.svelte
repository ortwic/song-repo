<script lang="ts">
  import 'tabulator-tables/dist/css/tabulator_bulma.min.css';
  import '../../styles/table.scss';
  import { t } from 'svelte-i18n';
  import type { ColumnDefinition, CellComponent, CellEditEventCallback, Tabulator } from 'tabulator-tables';
  import { column, comboBoxEditor } from './templates/column.helper';
  import { autoFilter, rangeFilter } from './templates/filter.helper';
  import format from './templates/formatters/formatter.helper';
  import Prompt from '../ui/PromptDialog.svelte';
  import Table from './Table.svelte'
  import AddEntry from './AddEntry.svelte';
  import FileDrop from './FileDrop.svelte';
  import SongResource, { type Dialog } from './SongResource.class';
  import { summaryFormatter } from './templates/responsive.helper';
  import SongService from '../../service/song.service';
  import type { MessageFormatter } from '../../service/i18n';
  import type { UserSong } from '../../model/song.model';
  import { showError, showInfo } from '../../store/notification.store';
  import { orientation, type Orientation } from '../../store/media.store';
  import genres from '../../data/genres.json';

  export let params: { id?: string } = {};

  const service = new SongService(params.id?.slice(1));
  const resource = new SongResource(service);
  const songs = service.usersongs;
  let prompt: Dialog<string>;

  const clickMenu = resource.getMenu(() => prompt);
  const genreSelector = comboBoxEditor(genres.map(v => v.name));
  const interaction = {
    cellEdited: updateHandler()
  };

  // https://tabulator.info/docs/5.4/edit#editor-list
  const columns = (t: MessageFormatter): ColumnDefinition[] => ([
    { title: "", field: "__responsive", formatter: 'responsiveCollapse', headerSort: false, responsive: 0, visible: false },
    column("Σ", "__summary", undefined, "string", summaryFormatter, { clickMenu, responsive: 0, visible: false }),
    column("✮", "fav", "50", undefined, format.favColumn, interaction, { responsive: -1 }),
    column("#", "progressLogs", "50", "array", format.length, { hozAlign: 'right', headerFilter: 'number', responsive: -1, visible: false }),
    column(t, "status", "50", "string", autoFilter(), format.status, interaction, { clickMenu, hozAlign: 'center', responsive: -1 }),
    column(t, "progress", "136", "number", rangeFilter(), format.progress, interaction, { responsive: 2 }),
    column(t, "artistImg", "30", undefined, format.bgImg, { responsive: 1 }),
    column(t, "artist", "200", "string", autoFilter(), comboBoxEditor(), interaction, { validator: 'required', responsive: 1 }),
    column(t, "title", "200", "string", autoFilter(), interaction, { editor: 'input', validator: 'required', responsive: 1 }),
    column(t, "genre", "136", "string", autoFilter(), format.genre, genreSelector, interaction, { responsive: 2 }),
    column(t, "style", "136", "string", autoFilter(), comboBoxEditor(), interaction, { responsive: 2 }),
    column(t, "source", "200", "string", autoFilter(), format.marked, interaction, { editor: 'input', responsive: 3 }),
    column(t, "uri", "200", "string", autoFilter(), format.url, interaction, { editor: 'input', responsive: 3, visible: false }),
    column(t, "key", "80", "string", autoFilter(), interaction, { editor: 'input', responsive: 4 }),
    column(t, "time", "80", "string", autoFilter(), interaction, { editor: 'input', responsive: 4 }),
    column(t, "bpm", "80", "string", autoFilter(), interaction, { editor: 'input', responsive: 4 }),
    column(t, "difficulty", "50", "number", format.difficulty, interaction, { responsive: 4 }),
    column(t, "features", "200", "string", autoFilter(), format.label, interaction, { editor: 'input', responsive: 5 }),
    column(t, "tags", "200", "string", autoFilter(), format.label, interaction, { editor: 'input', responsive: 6 }),
    column(t, "learnedOn", "136", "date", autoFilter(), format.timestamp, interaction, { editor: 'date', responsive: 7 }),
    column(t, "changedAt", "136", "date", autoFilter(), format.timestamp, { responsive: 7 }),
    { title: "id", field: "id", visible: false },
  ]);

  function updateHandler(): CellEditEventCallback {
    return async (cell: CellComponent): Promise<void> => {
      try {
        await service.setSong(cell.getData() as UserSong);
      } catch (error) {
        showError(error.message);
      }
    };
  }

  async function importJSON(data: string): Promise<void> {
    try {
      const result = await service.importSongs(JSON.parse(data));
      showInfo($t('songs.importDone', { 
        values: { 
          found: result.length, 
          total: $songs.length
        }
      }));
    } catch (error) {
      showError(error.message);
    }
  }

  function init(table: Tabulator, orientation: Orientation): void {
    const responsiveColumn = table.getColumn('__responsive');
    const summaryColumn = table.getColumn('__summary');
    if (orientation === 'portrait') {
      responsiveColumn.show();
      summaryColumn.show();

      const remainingWidth = window.innerWidth - responsiveColumn.getWidth();
      summaryColumn.setWidth(remainingWidth);
      table.getColumn('fav').hide();
      table.getColumn('status').hide();
    } else {
      responsiveColumn.hide();
      summaryColumn.hide();
    }
  }
</script>

<svelte:head>
<title>{ $t('menu.songs') } | Song Repertory</title>
</svelte:head>

<main>
  <Prompt bind:this={prompt} type='url' placeholder='https://example.com/files/sheet-music.pdf'
    title='{ $t('songs.resource.title') }' caption='{ $t('songs.resource.caption') }'>
    <div class='info' title='Tip'>{ $t('songs.resource.info') }</div>
  </Prompt>

  <FileDrop on:enter={() => showInfo($t('songs.import'))} on:addJson={({ detail }) => importJSON(detail)}>
    <Table columns={columns($t)}
      data={songs}
      idField='id'
      placeholder={ $t('songs.nosongs') }
      placeholderSearch={ $t('table.search') }
      persistenceID='songs.v1'
      groupHeader={format.groupBy}
      on:init={({ detail }) => init(detail, $orientation)}
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
 
  .info {
      padding: .4em 1em;
      border: 1px solid gray;
      background-color: lightblue;
      text-align: center;
      white-space: collapse balance;

      &::before {
          font-family: 'boxicons';
          padding-right: .2em;
          content: '\ea83';
      }
  }
</style>