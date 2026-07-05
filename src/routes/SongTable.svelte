<script lang="ts">
    import 'tabulator-tables/dist/css/tabulator_bulma.min.css';
    import '../styles/table.scss';
    import { t } from 'svelte-i18n';
    import { map } from 'rxjs';
    import type { CellComponent, CellEditEventCallback } from 'tabulator-tables';
    import TitlebarMenu from '../components/menus/TitlebarMenu.svelte';
    import type { ColumnDefinition } from '../components/table/tabulator/types';
    import { createColumnBuilder, createEditor } from '../components/table/templates/column.helper';
    import { autoFilter, dateFilter, hasValueFilter, rangeFilter, statusFilter } from '../components/table/templates/filter.helper';
    import { createIntervals, formatTemplates, groupByFormatter } from '../components/table/templates/formatters.svelte';
    import LoadingBar from '../components/ui/elements/LoadingBar.svelte';
    import Table from '../components/table/Table.svelte';
    import FileDrop from '../components/table/FileDrop.svelte';
    import { buildActionMenu } from '../components/table/templates/actionMenu.helper';
    import { summaryFormatter } from '../components/table/templates/responsive.helper';
    import { SongActions } from '../domain/song.actions';
    import { createSongEntity, type SongEntity } from '../domain/song.entity';
    import type { TableView } from '../model/table-view.model';
    import { refData } from '../service/base/app-cache.setup';
    import SessionService from '../service/user/user-session.service';
    import SongService, { viewStoreId } from '../service/user/user-song.service';
    import { showError, showInfo } from '../store/notification.store';
    import { settings } from '../store/user-settings.svelte';

    interface Props {
        params?: { id?: string };
    }

    let { params = {} }: Props = $props();

    const readonly = !!params.id;
    const sharedUid = params.id?.slice(1);
    const service = new SongService(sharedUid);
    const sessionService = new SessionService(service);
    const actions = new SongActions(service, sessionService);
    const actionMenu = buildActionMenu(actions, settings.advanced);
    const entities = service.usersongs$.pipe(
        map(items => items.map(song => {
            const entity = createSongEntity(song, settings.advanced);
            // Workaround to make headerFilter for status column work
            // https://github.com/ortwic/song-repo/issues/60
            entity.status = entity.resolvedStatus();
            return entity;
        }))
    );
    const column = createColumnBuilder();
    const format = formatTemplates(service, settings.advanced);

    const genreList = refData.genres.map((v) => v.name);
    const editor = createEditor(updateHandler(), readonly);

    // https://tabulator.info/docs/5.4/edit#editor-list
    const columns: ColumnDefinition[] = [
        {
            title: '',
            field: '__responsive',
            formatter: 'responsiveCollapse',
            headerSort: false,
            responsive: 0,
            visible: false,
        },
        column(0, '__summary', undefined, 'string', summaryFormatter(readonly), {
            visible: false,
            clickMenu: !readonly ? actionMenu : undefined,
        }),
        column(-1, 'fav', '50', undefined, format.favorite, editor()),
        column(-1, 'status', '50', 'string', format.status, statusFilter(), {
            visible: !readonly,
            clickMenu: !readonly ? actionMenu : undefined,
            hozAlign: 'center'
        }),
        column(2, 'progress', '136', 'number', format.progress, rangeFilter(), editor(), { visible: !readonly }),
        column(1, 'artistImg', '30', undefined, format.image),
        column(1, 'artist', '200', 'string', autoFilter(), editor('list'), { validator: 'required' }),
        column(1, 'title', '200', 'string', autoFilter(), editor('input'), { validator: 'required' }),
        column(4, 'uri', '30', 'string', format.resource, hasValueFilter([
            '<i class="bx bx-link"></i>',
            '<i class="bx bx-unlink"></i>',
            '<i class="bx bx-minus"></i>',
        ])),
        column(2, 'touchCount', '40', 'number', autoFilter(), editor('number'), { groupByFunc: (song: SongEntity) => createIntervals(song.touchCount), }),
        column(2, 'genre', '136', 'string', format.genre, autoFilter(), editor('list', genreList)),
        column(2, 'style', '136', 'string', autoFilter(), editor('list')),
        column(3, 'key', '80', 'string', autoFilter(), editor('input')),
        column(3, 'time', '80', 'string', autoFilter(), editor('input')),
        column(3, 'bpm', '80', 'string', autoFilter(), editor('input')),
        column(3, 'difficulty', '50', 'number', format.difficulty, editor('number')),
        column(4, 'source', '200', 'string', format.marked, autoFilter(), editor('input'), { visible: !readonly }),
        column(5, 'features', '200', 'string', format.label, autoFilter(), editor('input')),
        column(6, 'tags', '200', 'string', format.label, autoFilter(), editor('input'), { visible: !readonly }),
        column(7, 'learnedOn', '136', 'date', format.timestamp, dateFilter(), editor('date'), { visible: !readonly }),
        column(7, 'changedAt', '136', 'date', format.timestamp, dateFilter(), { visible: false }),
        column(8, 'mastery', '200', 'string', format.label, autoFilter(), { visible: false }),
        column(9, 'createdAt', '136', 'date', format.timestamp, dateFilter(), { visible: false }),
        { title: 'id', field: 'id', visible: false },
    ];

    function updateHandler(): CellEditEventCallback {
        return async (cell: CellComponent): Promise<void> => {
            try {
                const id = cell.getData().id;
                const field = cell.getField();
                await service.setSong({ id, [field]: cell.getValue() });
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
                        total: $entities.length,
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
    <LoadingBar isLoading={!$entities}>
        <FileDrop onEnter={() => showInfo($t('songs.import'))} onAddJson={(detail) => importJSON(detail)}>
            <Table
                {columns}
                data={entities}
                idField="id"
                placeholder={$t('songs.search-empty')}
                placeholderSearch={$t('table.search')}
                persistenceID={readonly ? `ro-${viewStoreId}` : viewStoreId}
                groupHeader={groupByFormatter}
                onInit={init}
                onError={showError}
            />
        </FileDrop>
    </LoadingBar>
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
