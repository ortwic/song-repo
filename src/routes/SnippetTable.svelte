<script lang="ts">
    import 'tabulator-tables/dist/css/tabulator_bulma.min.css';
    import '../styles/table.scss';
    import { t } from 'svelte-i18n';
    import type { CellComponent, CellEditEventCallback, GroupComponent } from 'tabulator-tables';
    import type { ColumnDefinition } from '../components/table/tabulator/types';
    import TitlebarMenu from '../components/menus/TitlebarMenu.svelte';
    import { createColumnBuilder, createEditor } from '../components/table/templates/column.helper';
    import { autoFilter, dateFilter } from '../components/table/templates/filter.helper';
    import { formatTemplates, snippetActionsFormatter, snippetGroupHeaderFormatter } from '../components/table/templates/formatters.svelte';
    import { snippetSummaryFormatter } from '../components/table/templates/responsive.helper';
    import LoadingBar from '../components/ui/elements/LoadingBar.svelte';
    import Table from '../components/table/Table.svelte';
    import type { Snippet } from '../model/snippet.model';
    import SnippetService from '../service/user/snippet.service';
    import type { TableView } from '../store/app.store';
    import { showError } from '../store/notification.store';
    import { settings } from '../store/user-settings.svelte';

    const service = new SnippetService();
    const data = service.snippets$;

    const column = createColumnBuilder();
    const editor = createEditor(updateHandler());
    const format = formatTemplates(null, settings.advanced);

    const columns: ColumnDefinition[] = [
        {
            title: '',
            field: '__responsive',
            headerSort: false,
            responsive: 0,
            visible: false,
            // ANNAHME: euer eigenes Responsive-Modul hängt sich hier genauso ein
            // wie zuvor der eingebaute 'responsiveCollapse'-Formatter.
        },
        column(0, '__summary', undefined, 'string', snippetSummaryFormatter(openSnippet), { visible: false }),
        column(-1, 'fav', '50', undefined, format.favorite, editor()),
        column(-1, '__actions', '50', undefined, snippetActionsFormatter(openSnippet), { headerSort: false, hozAlign: 'center' }),
        column(1, 'title', '200', 'string', autoFilter()),
        column(1, 'artist', '200', 'string', autoFilter()),
        column(1, 'instruments', '200', 'string', autoFilter()),
        column(2, 'key', '80', 'string', autoFilter()),
        column(2, 'time', '80', 'string', autoFilter()),
        column(2, 'bpm', '80', 'string', autoFilter()),
        column(2, 'difficulty', '50', 'number', format.difficulty),
        column(2, 'source', '200', 'string', autoFilter(), { visible: false }),
        column(3, 'tags', '200', 'string', format.label, autoFilter()),
        column(3, 'type', '100', 'string', autoFilter()),
        column(4, 'changedAt', '136', 'date', format.timestamp, dateFilter(), { visible: false }),
        column(4, 'createdAt', '136', 'date', format.timestamp, dateFilter(), { visible: false }),
        { title: 'id', field: 'id', visible: false },
        { title: 'groups', field: 'groups', visible: false },
    ];

    function openSnippet(snippet: Snippet): void {
        console.log('TODO: SnippetActions.open', snippet);
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
    <title>{$t('menu.snippets')} | Song-Repo</title>
</svelte:head>

<main>
    <TitlebarMenu minimal={true} />
    <LoadingBar isLoading={!$data}>
        <Table
            {columns}
            data={data}
            idField="id"
            placeholder={$t('common.search-empty')}
            placeholderSearch={$t('table.search')}
            persistenceID="snippets.v1"
            groupBy={["groups"]}
            groupHeader={snippetGroupHeaderFormatter}
            onInit={init}
            onError={showError}
        />
    </LoadingBar>
</main>