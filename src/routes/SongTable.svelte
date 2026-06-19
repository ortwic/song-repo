<script lang="ts">
    import 'tabulator-tables/dist/css/tabulator_bulma.min.css';
    import '../styles/table.scss';
    import { t } from 'svelte-i18n';
    import type { CellComponent, CellEditEventCallback } from 'tabulator-tables';
    import TitlebarMenu from '../components/menus/TitlebarMenu.svelte';
    import type { ColumnDefinition } from '../components/table/tabulator/types';
    import { createColumnBuilder, createEditor } from '../components/table/templates/column.helper';
    import { autoFilter, dateFilter, rangeFilter } from '../components/table/templates/filter.helper';
    import { groupByFormatter } from '../components/table/templates/Formatter.class';
    import Table from '../components/table/Table.svelte';
    import FileDrop from '../components/table/FileDrop.svelte';
    import { buildActionMenu } from '../components/table/templates/actionMenu.helper';
    import { summaryFormatter } from '../components/table/templates/responsive.helper';
    import { SongActions } from '../domain/song.actions';
    import type { UserSong } from '../model/song.model';
    import type { TableView } from '../model/table-view.model';
    import type { MessageFormatter } from '../service/base/i18n.setup';
    import { refData } from '../service/base/app-cache.setup';
    import SessionService from '../service/user/user-session.service';
    import SongService, { viewStoreId } from '../service/user/user-song.service';
    import { showError, showInfo } from '../store/notification.store';

    interface Props {
        params?: { id?: string };
    }

    let { params = {} }: Props = $props();

    const readonly = !!params.id;
    const sharedUid = params.id?.slice(1);
    const service = new SongService(sharedUid);
    const sessionService = new SessionService(service);
    const actions = new SongActions(service, sessionService);
    const actionMenu = buildActionMenu(actions, $t);
    const songs = service.usersongs$;
    const column = createColumnBuilder(actions);

    const genreList = refData.genres.map((v) => v.name);
    const editor = createEditor(updateHandler(), readonly);

    // https://tabulator.info/docs/5.4/edit#editor-list
    const columns = (t: MessageFormatter): ColumnDefinition[] => [
        {
            title: '',
            field: '__responsive',
            formatter: 'responsiveCollapse',
            headerSort: false,
            responsive: 0,
            visible: false,
        },
        column('Σ', 0, '__summary', undefined, 'string', 'default', summaryFormatter(readonly), {
            visible: false,
            clickMenu: !readonly ? actionMenu : undefined,
        }),
        column('✮', -1, 'fav', '50', undefined, 'favorite', editor()),
        column(t, -1, 'status', '50', 'string', 'status', autoFilter(), editor(), {
            visible: !readonly,
            clickMenu: !readonly ? actionMenu : undefined,
            hozAlign: 'center',
        }),
        column(t, 2, 'progress', '136', 'number', 'progress', rangeFilter(), editor(), { visible: !readonly }),
        column(t, 1, 'artistImg', '30', undefined, 'image'),
        column(t, 1, 'artist', '200', 'string', 'default', autoFilter(), editor('list'), { validator: 'required' }),
        column(t, 1, 'title', '200', 'string', 'default', autoFilter(), editor('input'), { validator: 'required' }),
        column(t, 2, 'genre', '136', 'string', 'genre', autoFilter(), editor('list', genreList)),
        column(t, 2, 'style', '136', 'string', 'default', autoFilter(), editor('list')),
        column(t, 3, 'key', '80', 'string', 'default', autoFilter(), editor('input')),
        column(t, 3, 'time', '80', 'string', 'default', autoFilter(), editor('input')),
        column(t, 3, 'bpm', '80', 'string', 'default', autoFilter(), editor('input')),
        column(t, 3, 'difficulty', '50', 'number', 'difficulty', editor('number')),
        column(t, 4, 'source', '200', 'string', 'marked', autoFilter(), editor('input'), { visible: !readonly }),
        column(t, 4, 'uri', '200', 'string', 'url', autoFilter(), editor('input')),
        column(t, 5, 'features', '200', 'string', 'label', autoFilter(), editor('input')),
        column(t, 6, 'tags', '200', 'string', 'label', autoFilter(), editor('input'), { visible: !readonly }),
        column(t, 7, 'learnedOn', '136', 'date', 'timestamp', dateFilter(), editor('date'), { visible: !readonly }),
        column(t, 7, 'changedAt', '136', 'date', 'timestamp', dateFilter(), { visible: !readonly }),
        { title: 'id', field: 'id', visible: false },
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

    async function importJSON(data: string): Promise<void> {
        try {
            const result = await service.importSongs(JSON.parse(data));
            showInfo(
                $t('songs.importDone', {
                    values: {
                        found: result.length,
                        total: $songs.length,
                    },
                })
            );
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
    <title>{$t('menu.repo')} | Song-Repo</title>
</svelte:head>

<main>
    <TitlebarMenu minimal={true} />
    <FileDrop onEnter={() => showInfo($t('songs.import'))} onAddJson={(detail) => importJSON(detail)}>
        <Table
            columns={columns($t)}
            data={songs}
            idField="id"
            placeholder={$t('songs.search-empty')}
            placeholderSearch={$t('table.search')}
            persistenceID={readonly ? `ro-${viewStoreId}` : viewStoreId}
            groupHeader={groupByFormatter}
            onInit={init}
            onError={showError}
        />
    </FileDrop>
</main>

<style lang="scss">
    footer {
        position: sticky;
        bottom: calc(48px + 1rem);
        z-index: 20;
        height: 0;
        text-align: left;
    }
</style>
