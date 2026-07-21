<script lang="ts">
    import 'tabulator-tables/dist/css/tabulator_bulma.min.css';
    import '../styles/table.scss';
    import { t } from 'svelte-i18n';
    import { push } from '@keenmate/svelte-spa-router';
    import { firstValueFrom } from 'rxjs';
    import type { CellComponent, CellEditEventCallback } from 'tabulator-tables';
    import type { ColumnDefinition } from '../components/table/tabulator/types';
    import { createColumnBuilder, createEditor } from '../components/table/templates/column.helper';
    import { autoFilter, dateFilter } from '../components/table/templates/filter.helper';
    import { formatTemplates, snippetActionsFormatter, createSnippetGroupHeader } from '../components/table/templates/formatters.svelte';
    import { snippetSummaryFormatter } from '../components/table/templates/responsive.helper';
    import { openDialog, type NavigationContext } from '../components/dialog-context.svelte';
    import TitlebarMenu from '../components/menus/TitlebarMenu.svelte';
    import LoadingBar from '../components/ui/elements/LoadingBar.svelte';
    import type { TableView } from '../components/table/table.action';
    import { tableContext } from '../components/table/table.svelte';
    import TableSearch from '../components/ui/TableSearch.svelte';
    import type { UserSnippet } from '../model/snippet.model';
    import SnippetService, { SNIPPETS_SETTINGS_ID } from '../service/user/snippet.service';
    import { orientation } from '../store/media.store';
    import { menu } from '../store/menu-context.svelte';
    import { showError } from '../store/notification.store';
    import { settings } from '../store/user-settings.svelte';

    interface Props {
        routeParams?: { id?: string };
    }

    let { 
        routeParams = {}
    }: Props = $props();

    const service = new SnippetService();
    const data$ = service.snippets$;

    const column = createColumnBuilder('songs');
    const editor = createEditor(updateHandler());
    const format = formatTemplates(null, settings.advanced);
    const pushSnippetId = (id: string) => push(`/snippets/${id}`);
    const { formatter: snippetGroupHeaderFormatter } = createSnippetGroupHeader(pushSnippetId);

    const columns: ColumnDefinition[] = [
        {
            title: '',
            field: '__responsive',
            headerSort: false,
            responsive: 0,
            visible: false,
        },
        column(0, '__summary', undefined, 'string', snippetSummaryFormatter(pushSnippetId), { visible: false }),
        column(-1, 'fav', '50', undefined, format.favorite, editor()),
        column(-1, '__actions', '50', undefined, snippetActionsFormatter(pushSnippetId), { headerSort: false, hozAlign: 'center' }),
        column(1, 'title', '200', 'string', autoFilter()),
        column(1, 'artist', '200', 'string', autoFilter()),
        column(1, 'instruments', '200', 'string', autoFilter()),
        column(1, 'mxmlPath', '200', 'string', autoFilter(), format.scorePreview, { visible: false }),
        column(2, 'type', '100', 'string', format.translate('snippets'), autoFilter()),
        column(2, 'tags', '200', 'string', format.label, autoFilter()),
        column(2, 'key', '80', 'string', autoFilter(), { visible: false }),
        column(2, 'time', '80', 'string', autoFilter(), { visible: false }),
        column(2, 'bpm', '80', 'string', autoFilter(), { visible: false }),
        column(2, 'difficulty', '50', 'number', format.difficulty, { visible: false }),
        column(2, 'source', '200', 'string', autoFilter(), { visible: false }),
        column(3, 'groups', '100', 'string', autoFilter(), format.label, { visible: false }),
        column(4, 'changedAt', '136', 'date', format.timestamp, dateFilter(), { visible: false }),
        column(4, 'createdAt', '136', 'date', format.timestamp, dateFilter(), { visible: false }),
        { title: 'id', field: 'id', visible: false },
    ];

    $effect(() => {
        openSnippet(routeParams?.id);
    });

    async function openSnippet(id: string | undefined) {
        if (id) {
            const { item, siblings: items } = await firstValueFrom(service.getWithSiblings(id));
            const currentIndex = items.findIndex(s => s.id === item.id);
            return openDialog<NavigationContext<UserSnippet>>('SnippetDialog', {
                currentIndex,
                items
            });
        }
    }
    
    function updateHandler(): CellEditEventCallback {
        return async (cell: CellComponent): Promise<void> => {
            try {
                const id = cell.getData().id;
                const field = cell.getField();
                await service.setSnippet({ id, [field]: cell.getValue() });
            } catch (error) {
                showError(error.message);
            }
        };
    }

    function init(view: TableView): void {
        const responsiveColumn = view.table.getColumn('__responsive');
        const summaryColumn = view.table.getColumn('__summary');
        if (view.useResponsiveLayout) {
            responsiveColumn.show();
            summaryColumn.show();
            const remainingWidth = window.innerWidth - responsiveColumn.getWidth();
            summaryColumn.setWidth(remainingWidth);
        } else {
            responsiveColumn.hide();
            summaryColumn.hide();
        }
    }
</script>

<svelte:head>
    <title>{$t('menu.snippets')} | {import.meta.env.PACKAGE_NAME}</title>
</svelte:head>

<main use:menu.offset>
    <TitlebarMenu minimal={true} />
    <LoadingBar isLoading={!$data$}>
        {#if $orientation === 'portrait'}
        <TableSearch placeholder={$t('table.search')} />
        {/if}
        <div use:tableContext={{
            columns,
            data$: service.snippets$,
            idField: "id",
            placeholder: $t('common.search-empty'),
            persistenceID: SNIPPETS_SETTINGS_ID,
            groupBy: ["type", "groups"],
            groupByLabel: $t('menu.table.group-by'),
            groupFormatter: snippetGroupHeaderFormatter,
            groupStartOpen: [true, false],
            onInit: init,
            onError: showError
        }}></div>
    </LoadingBar>
</main>