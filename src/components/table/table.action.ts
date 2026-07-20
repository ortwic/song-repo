import 'tabulator-tables/dist/css/tabulator_bulma.min.css';
import {
    type ColumnComponent,
    type GroupArg,
    type GroupComponent,
    type Options,
    Tabulator,
    AccessorModule,
    ClipboardModule,
    DownloadModule,
    EditModule,
    ExportModule,
    FilterModule,
    FormatModule,
    GroupRowsModule,
    HistoryModule,
    HtmlTableImportModule,
    KeybindingsModule,
    MenuModule,
    MoveColumnsModule,
    PersistenceModule,
    PrintModule,
    ResizeColumnsModule,
    ResizeRowsModule,
    ResizeTableModule,
    SortModule,
    ValidateModule,
} from 'tabulator-tables';
import * as luxon from 'luxon';
import type { ColumnDefinition } from './tabulator/types';
import { default as ResponsiveLayoutModule, type CollapsedCellData } from './tabulator/modules/ResponsiveLayout';
import { Observable } from 'rxjs';
import { showError } from '../../store/notification.store';
import { orientation, type Orientation } from '../../store/media.store';
import responsiveCollapse from './tabulator/modules/formatters/responsiveCollapse';

window['luxon'] = luxon;

Tabulator.registerModule([
    AccessorModule,
    ClipboardModule,
    DownloadModule,
    EditModule,
    ExportModule,
    FilterModule,
    FormatModule,
    GroupRowsModule,
    HistoryModule,
    HtmlTableImportModule,
    KeybindingsModule,
    MenuModule,
    MoveColumnsModule,
    PersistenceModule,
    PrintModule,
    ResizeColumnsModule,
    ResizeRowsModule,
    ResizeTableModule,
    ResponsiveLayoutModule,
    SortModule,
    ValidateModule,
]);

Tabulator.extendModule('format', 'formatters', {
    responsiveCollapse,
});

interface TableViewParams {
    addAction: {
        label: string;
        action: () => Promise<void>;
    },
    exportAction: {
        fileName: string;
    }
}

export interface TableView extends TableViewParams {
    id: string;
    table: Tabulator;
    groups: string[];
    toggleGroup(field: string): void;
    useResponsiveLayout: boolean;
}

type GroupFormatter<T> = (value: unknown, count: number, data: T[], group?: GroupComponent) => string | HTMLElement;

export interface TableParams<T> extends Options, Partial<TableViewParams> {
    idField: keyof T;
    columns?: ColumnDefinition[];
    data$: Observable<T[]>;
    groupByLabel?: string;
    groupFormatter?: GroupFormatter<T>;
    detailFormatter?: (data: CollapsedCellData[]) => HTMLElement;
    onInit?: (view: TableView) => void;
    onDestroy?: () => void;
    onError?: (error: string) => void;
}

export function createTable<T>(node: HTMLElement, params: TableParams<T>) {
    const rowGroups: Record<string, GroupArg> = {};
    let lastData: T[] | undefined;
    const options: Options = {
        columns: params.columns,
        placeholder: params.placeholder,
        clipboard: true,
        movableColumns: true,
        groupBy: params.groupBy,
        groupHeader: params.groupFormatter as Options['groupHeader'],
        groupStartOpen: params.groupStartOpen,
        groupToggleElement: 'header',
        groupUpdateOnCellEdit: true,
        footerElement: '#footer',
        history: true,
        reactiveData: true,
        responsiveLayoutCollapseStartOpen: false,
        responsiveLayoutCollapseFormatter: params.detailFormatter,
        pagination: false,
        persistenceID: params.persistenceID,
        persistenceMode: 'local',
        persistenceWriterFunc(id, type, settings) {
            if (type === 'group') {
                settings = {
                    // Issue #41: workaround for inability to persist custom groupBy functions
                    groupBy: Object.keys(rowGroups),
                };
            }
            localStorage.setItem(id + '-' + type, JSON.stringify(settings));
        },
    };

    let _table: Tabulator;
    let _useResponsiveLayout = false;

    function createTabulator(node: HTMLElement, orientation: Orientation) {
        _table?.destroy();

        _useResponsiveLayout = orientation === 'portrait';
        const usePersistance = !!params.persistenceID;
        const persistence = {
            columns: usePersistance && !_useResponsiveLayout ? ['width', 'visible'] : false,
            sort: usePersistance,
            headerFilter: usePersistance && !_useResponsiveLayout,
            filter: usePersistance && _useResponsiveLayout,
            group: usePersistance,
        };

        _table = new Tabulator(node, {
            ...options,
            layout: _useResponsiveLayout ? 'fitDataStretch' : 'fitData',
            headerVisible: !_useResponsiveLayout,
            responsiveLayout: _useResponsiveLayout ? 'collapse' : undefined,
            persistence,
        });

        _table.on('tableBuilt', () => handleTableBuilt(_table, _useResponsiveLayout));
        _table.on('tableDestroyed', () => params.onDestroy?.());
    }

    function handleTableBuilt(table: Tabulator, useResponsiveLayout: boolean) {
        if (lastData !== undefined) {
            table.setData(lastData);
        }
        initHeaderMenu(table);
        initGroupBy(table);

        params.onInit?.({
            id: params.persistenceID,
            addAction: params.addAction,
            exportAction: params.exportAction,
            table,
            useResponsiveLayout,
            groups: Object.keys(rowGroups),
            toggleGroup: (field: string) => toggleGroup(table, field),
        });
        return table;
    }

    function initHeaderMenu(table: Tabulator) {
        params.columns
            ?.filter((c) => c.headerMenu)
            .forEach((c) => {
                if (c.headerMenu.length) {
                    c.headerMenu = [];
                }
                if (Array.isArray(c.headerMenu)) {
                    c.headerMenu.push({
                        label: `${params.groupByLabel} ${c.title}`,
                        action: (ev: Event, column: ColumnComponent) => toggleGroup(table, c.field),
                    });
                }
            });
    }

    function initGroupBy(table: Tabulator) {
        if (Array.isArray(table.options.groupBy)) {
            table.options.groupBy.forEach((field) => {
                if (field) {
                    rowGroups[field] = params.columns.find((c) => c.field === field)?.groupByFunc;
                    const column = table.getColumn(field);
                    column && column.getElement()?.classList.add('primary');
                }
            });
            setGroupBy(table);
        }
    }

    function toggleGroup(table: Tabulator, field: string) {
        const element = table.getColumn(field)?.getElement();
        if (!(field in rowGroups)) {
            rowGroups[field] = params.columns.find((c) => c.field === field)?.groupByFunc;
            element?.classList.add('primary');
        } else {
            delete rowGroups[field];
            element?.classList.remove('primary');
        }
        setGroupBy(table);
    }

    function setGroupBy(table: Tabulator) {
        const groups = Object.keys(rowGroups).map((k) => rowGroups[k] ?? k);
        table.setGroupBy(groups.length ? (groups as string[]) : undefined);
    }

    async function setData(table: Tabulator, data: T[]): Promise<void> {
        lastData = data;
        const idField = params.idField;
        const areEquivalent = (source: T[]) => {
            return (
                source.length === data.length &&
                source.every((item) => data.map((v: T) => v[idField]).indexOf(item[idField]) > -1)
            );
        };

        if (table && data) {
            try {
                if (data.length && idField && areEquivalent(table.getData())) {
                    // avoids flickering and better performance
                    await table.updateData(data).catch((err) => {
                        // Since the Svelte 5 migration, this will throw
                        // 'Update error: Unable to find row' error after
                        // an update, but this is not critical as it will
                        // be fixed with the next Firebase emit.
                        if (import.meta.env.DEV) {
                            throw err;
                        }
                    });

                    if (import.meta.env.DEV) {
                        console.debug('upd', data.length);
                    }

                } else {
                    await table.setData(data);
                    
                    if (import.meta.env.DEV) {
                        console.debug('set', data.length);
                    }
                }
            } catch (error) {
                showError(error);
            }
        }
    }

    const dataSubscription = params.data$.subscribe((value) => setData(_table, value));
    const unsubscribe = orientation.subscribe((o) => createTabulator(node, o));

    return {
        destroy() {
            _table?.destroy();
            dataSubscription.unsubscribe();
            unsubscribe();
        },
    };
}
