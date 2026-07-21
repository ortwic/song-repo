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
    import { createIntervals, formatTemplates, songGroupHeaderFormatter } from '../components/table/templates/formatters.svelte';
    import { type DialogAction, openDialog } from '../components/dialog-context.svelte';
    import LoadingBar from '../components/ui/elements/LoadingBar.svelte';
    import type { TableView } from '../components/table/table.action';
    import { tableContext } from '../components/table/table.svelte';
    import FileDrop from '../components/ui/FileDrop.svelte';
    import { buildActionMenu } from '../components/table/templates/actionMenu.helper';
    import { songSummaryFormatter } from '../components/table/templates/responsive.helper';
    import TableSearch from '../components/ui/TableSearch.svelte';
    import DonationReminderState from '../domain/donation-reminder.state';
    import { SongActions } from '../domain/song.actions';
    import { createSongEntity, type SongEntity } from '../domain/song.entity';
    import type { UserSong } from '../model/song.model';
    import { refData } from '../service/base/app-cache.setup';
    import SongRequestService from '../service/user/song-requests.service';
    import SessionService from '../service/user/user-session.service';
    import SongService, { SONG_SETTINGS_ID } from '../service/user/user-song.service';
    import { orientation } from '../store/media.store';
    import { menu } from '../store/menu-context.svelte';
    import { showError, showInfo } from '../store/notification.store';
    import { settings } from '../store/user-settings.svelte';
    
    interface Props {
        routeParams?: { uid?: string };
    }

    let { routeParams = {} }: Props = $props();

    const readonly = $derived(!!routeParams.uid);
    const sharedUid = $derived(routeParams.uid?.slice(1));
    const donationState = $derived(new DonationReminderState(sharedUid));
    const service = $derived(new SongService(sharedUid));
    const requestService = $derived(new SongRequestService(service));
    const sessionService = $derived(new SessionService(service));
    const actions = $derived(new SongActions(service, sessionService));
    const actionMenu = $derived(buildActionMenu(actions, settings.advanced));
    const entities = $derived(service.usersongs$.pipe(
        map(items => items.map(song => {
            const entity = createSongEntity(song, settings.advanced);
            // Workaround to make headerFilter for status column work
            // https://github.com/ortwic/song-repo/issues/60
            entity.status = entity.resolvedStatus();
            return entity;
        }))
    ));
    const column = createColumnBuilder('songs');
    const format = $derived(formatTemplates(service, settings.advanced));

    const genreList = refData.genres.map((v) => v.name);
    const editor = $derived(createEditor(updateHandler(), readonly));

    // https://tabulator.info/docs/5.4/edit#editor-list
    const columns: ColumnDefinition[] = $derived([
        {
            title: '',
            field: '__responsive',
            formatter: 'responsiveCollapse',
            headerSort: false,
            responsive: 0,
            visible: false,
        },
        column(0, '__summary', undefined, 'string', songSummaryFormatter(readonly, sendSongRequest), {
            visible: false,
            clickMenu: !readonly ? actionMenu : undefined,
        }),
        column(-1, '__request', '50', undefined, format.action('jukebox', sendSongRequest), { visible: readonly }),
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
        column(5, 'features', '200', 'string', format.label, autoFilter(), editor('array')),
        column(6, 'tags', '200', 'string', format.label, autoFilter(), editor('array'), { visible: !readonly }),
        column(7, 'learnedOn', '136', 'date', format.timestamp, dateFilter(), editor('date'), { visible: !readonly }),
        column(7, 'changedAt', '136', 'date', format.timestamp, dateFilter(), { visible: false }),
        column(8, 'mastery', '200', 'string', format.label, autoFilter(), { visible: false }),
        column(9, 'createdAt', '136', 'date', format.timestamp, dateFilter(), { visible: false }),
        { title: 'id', field: 'id', visible: false },
    ]);

    async function addSong() {
        const newSong = await openDialog<UserSong, UserSong>('EditSongDialog');
        if (newSong !== null) {
            await service.addSong(newSong);
        }
    }

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

    function sendSongRequest(song: UserSong): void {
        requestService.addRequest(sharedUid, song.id).then(() => {
            showInfo($t('songs.request-sent', { 
                values: { 
                    name: `${song.artist} - ${song.title}`
                } 
            }));
        });

        if (!donationState.hasConfirmed()) {
            openDialog<UserSong, DialogAction>('DonationHintDialog', song).then(action => {
                if (action === 'confirm') {
                    donationState.markConfirmed();
                }
            });
        }
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
    <title>{$t('menu.repo')} | {import.meta.env.PACKAGE_NAME}</title>
</svelte:head>

<main use:menu.offset>
    <TitlebarMenu minimal={true} />
    <LoadingBar isLoading={!$entities}>
        <FileDrop onEnter={() => showInfo($t('songs.import'))} onAddJson={(detail) => importJSON(detail)}>
            {#if $orientation === 'portrait'}
            <TableSearch placeholder={$t('table.search')} />
            {/if}
            <div use:tableContext={{
                columns,
                data$: entities,
                idField: "id",
                addAction: {
                    label: $t('songs.add-new'),
                    action: addSong
                },
                exportAction: {
                    fileName: $t('menu.table.exportTitle')
                },
                placeholder: $t('common.search-empty'),
                groupByLabel: $t('menu.table.group-by'),
                persistenceID: readonly ? `${SONG_SETTINGS_ID}.readonly` : SONG_SETTINGS_ID,
                groupFormatter: songGroupHeaderFormatter,
                groupStartOpen: [true, (v, n) => n < 3],
                onInit: init,
                onError: showError
            }}></div>
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
