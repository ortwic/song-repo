<script lang="ts">
  import 'tabulator-tables/dist/css/tabulator_bulma.min.css';
  import '../styles/table.scss';
  import { getContext } from 'svelte';
  import { t } from 'svelte-i18n';
  import { location } from 'svelte-spa-router';
  import type { CellComponent, CellEditEventCallback } from 'tabulator-tables';
  import type { ColumnDefinition } from '../components/table/tabulator/types';
  import { column, createEditor } from '../components/table/templates/column.helper';
  import { autoFilter, rangeFilter } from '../components/table/templates/filter.helper';
  import { groupByFormatter } from '../components/table/templates/Formatter.class';
  import Table from '../components/table/Table.svelte'
  import AddEntry from '../components/table/AddEntry.svelte';
  import FileDrop from '../components/table/FileDrop.svelte';
  import { SongActions } from '../components/table/SongActions.class';
  import { buildActionMenu } from '../components/table/templates/actionMenu.helper';
  import { summaryFormatter } from '../components/table/templates/responsive.helper';
  import SongService, { viewStoreId } from '../service/user-song.service';
  import type { MessageFormatter } from '../service/i18n.setup';
  import type { Dialog } from '../model/dialog.model';
  import type { UserSong } from '../model/song.model';
  import type { TableView } from '../model/table-view.model';
  import { showError, showInfo } from '../store/notification.store';
  import genres from '../data/genres.json';

  interface Props {
    params?: { id?: string };
  }

  let { params = {} }: Props = $props();

  const readonly = !!params.id;
  const service = new SongService(params.id?.slice(1), $location === '/samples');
  const actions = new SongActions(service);
  const clickMenu = !readonly ? buildActionMenu : () => undefined;
  const songs = service.usersongs;
  const prompt = getContext<Dialog<string>>('resource-prompt');

  const genreList = genres.map(v => v.name);
  const editor = createEditor(updateHandler(), readonly);

  // https://tabulator.info/docs/5.4/edit#editor-list
  const columns = (t: MessageFormatter): ColumnDefinition[] => ([
    { title: "", field: "__responsive", formatter: 'responsiveCollapse', headerSort: false, responsive: 0, visible: false },
    column("Σ", 0, "__summary", undefined, "string", "default", summaryFormatter(readonly), { visible: false, clickMenu: clickMenu(actions, t, () => prompt) }),
    column("✮", -1, "fav", "50", undefined, "favorite", editor()),
    column(t, -1, "status", "50", "string", "status", autoFilter(), editor(), { visible: !readonly, clickMenu: clickMenu(actions, t, () => prompt), hozAlign: 'center' }),
    column("#", -1, "progressLogs", "50", "array", "length", { visible: false, hozAlign: 'right', headerFilter: 'number' }),
    column(t, 2, "progress", "136", "number", "progress", rangeFilter(), editor(), { visible: !readonly }),
    column(t, 1, "artistImg", "30", undefined, "image"),
    column(t, 1, "artist", "200", "string", "default", autoFilter(), editor('list'), { validator: 'required', }),
    column(t, 1, "title", "200", "string", "default", autoFilter(), editor('input'), { validator: 'required', }),
    column(t, 2, "genre", "136", "string", "genre", autoFilter(), editor('list', genreList)),
    column(t, 2, "style", "136", "string", "default", autoFilter(), editor('list')),
    column(t, 3, "key", "80", "string", "default", autoFilter(), editor('input')),
    column(t, 3, "time", "80", "string", "default", autoFilter(), editor('input')),
    column(t, 3, "bpm", "80", "string", "default", autoFilter(), editor('input')),
    column(t, 3, "difficulty", "50", "number", "difficulty", editor('number')),
    column(t, 4, "source", "200", "string", "marked", autoFilter(), editor('input'), { visible: !readonly }),
    column(t, 4, "uri", "200", "string", "url", autoFilter(), editor('input')),
    column(t, 5, "features", "200", "string", "label", autoFilter(), editor('input')),
    column(t, 6, "tags", "200", "string", "label", autoFilter(), editor('input'), { visible: !readonly }),
    column(t, 7, "learnedOn", "136", "date", "timestamp", autoFilter(), editor('date'), { visible: !readonly }),
    column(t, 7, "changedAt", "136", "date", "timestamp", autoFilter(), { visible: !readonly }),
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

  function init(view: TableView): void {
    const responsiveColumn = view.table.getColumn('__responsive');
    const summaryColumn = view.table.getColumn('__summary');
    if (view.useResponsiveLayout) {
      responsiveColumn.show();
      summaryColumn.show();

      const remainingWidth = window.innerWidth - responsiveColumn.getWidth();
      summaryColumn.setWidth(remainingWidth);
      view.table.getColumn('fav').hide();
      view.table.getColumn('status').hide();
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
  <FileDrop on:enter={() => showInfo($t('songs.import'))} on:addJson={({ detail }) => importJSON(detail)}>
    <Table columns={columns($t)}
      data={songs}
      idField='id'
      placeholder={ $t('songs.nosongs') }
      placeholderSearch={ $t('table.search') }
      persistenceID={readonly ? `ro-${viewStoreId}` : viewStoreId}
      groupHeader={groupByFormatter}
      on:init={({ detail }) => init(detail)}
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
    z-index: 20;
    height: 0;
    text-align: left;
  }
</style>