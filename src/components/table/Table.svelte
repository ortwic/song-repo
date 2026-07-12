<script lang="ts" generics="T">
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
    import { t } from 'svelte-i18n';
    import { Observable, fromEvent, map, take } from 'rxjs';
    import { tableView, type TableView } from '../../store/app.store';
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

    type GroupFormatter = (value: unknown, count: number, data: T[], group?: GroupComponent) => string | HTMLElement;

    const rowGroups: Record<string, GroupArg> = {};
    const isGroupedBy = (field: string) => field in rowGroups;
    interface Props {
        idField: keyof T;
        columns?: ColumnDefinition[];
        data: Observable<T[]>;
        groupBy?: Array<keyof T>;
        groupStartOpen?: Options['groupStartOpen'];
        placeholder?: string;
        groupHeader?: GroupFormatter;
        detailFormatter?: (data: CollapsedCellData[]) => HTMLElement;
        persistenceID?: string;
        onInit?: (view: TableView) => void;
        onError?: (error: string) => void;
    }

    let {
        idField,
        columns = undefined,
        data,
        groupBy = undefined,
        groupStartOpen = [true, (v, n) => n < 3],
        placeholder = '',
        groupHeader = undefined,
        detailFormatter = undefined,
        persistenceID = '',
        onInit,
        onError,
    }: Props = $props();

    let useResponsiveLayout = $state(false);
    let table$: Observable<Tabulator> = $state();

    const usePersistance = !!persistenceID;
    const options: Options = {
        columns,
        placeholder,
        clipboard: true,
        movableColumns: true,
        groupBy,
        groupHeader,
        groupStartOpen,
        groupToggleElement: 'header',
        groupUpdateOnCellEdit: true,
        footerElement: '#footer',
        history: true,
        reactiveData: true,
        responsiveLayoutCollapseStartOpen: false,
        responsiveLayoutCollapseFormatter: detailFormatter,
        pagination: false,
        persistenceID,
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

    function createTabulator(node: HTMLElement) {
        let tableInstance: Tabulator;
        function createTable(node: HTMLElement, orientation: Orientation) {
            tableInstance?.destroy();

            useResponsiveLayout = orientation === 'portrait';
            const persistence = {
                columns: usePersistance && !useResponsiveLayout ? ['width', 'visible'] : false,
                sort: usePersistance,
                headerFilter: usePersistance && !useResponsiveLayout,
                filter: usePersistance && useResponsiveLayout,
                group: usePersistance,
            };

            tableInstance = new Tabulator(node, {
                ...options,
                layout: useResponsiveLayout ? 'fitDataStretch' : 'fitData',
                headerVisible: !useResponsiveLayout,
                responsiveLayout: useResponsiveLayout ? 'collapse' : undefined,
                persistence,
            });

            tableInstance.on('tableDestroyed', () => tableView.set(undefined));
            table$ = fromEvent(tableInstance, 'tableBuilt').pipe(
                take(1),
                map(() => handleTableBuilt(tableInstance, useResponsiveLayout))
            );
        }

        const unsubscribe = orientation.subscribe((o) => createTable(node, o));

        return {
            destroy() {
                tableInstance?.destroy();
                unsubscribe();
            },
        };
    }

    $effect(() => {
        setData($table$, $data);
    });

    async function setData(tableInstance: Tabulator, data: T[]): Promise<void> {
        const areEquivalent = (source: T[]) => {
            return (
                source.length === data.length &&
                source.every((item) => data.map((v: T) => v[idField]).indexOf(item[idField]) > -1)
            );
        };

        if (tableInstance && data) {
            try {
                if (data.length && idField && areEquivalent(tableInstance.getData())) {
                    // avoids flickering and better performance
                    await tableInstance.updateData(data).catch((err) => {
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
                    await tableInstance.setData(data);
                    
                    if (import.meta.env.DEV) {
                        console.debug('set', data.length);
                    }
                }
            } catch (error) {
                showError(error);
            }
        }
    }

    function handleTableBuilt(table: Tabulator, useResponsiveLayout: boolean) {
        initHeaderMenu(table);
        initGroupBy(table);

        const view: TableView = {
            id: persistenceID,
            table,
            useResponsiveLayout,
            groups: Object.keys(rowGroups),
            toggleGroup: (field: string) => toggleGroup(table, field),
        };
        tableView.set(view);
        onInit?.(view);
        return table;
    }

    function initHeaderMenu(table: Tabulator) {
        columns
            ?.filter((c) => c.headerMenu)
            .forEach((c) => {
                if (c.headerMenu.length) {
                    c.headerMenu.length = 0;
                }
                if (Array.isArray(c.headerMenu)) {
                    c.headerMenu.push({
                        label: `${$t('menu.table.group-by')} ${c.title}`,
                        action: (ev: Event, column: ColumnComponent) => toggleGroup(table, c.field),
                    });
                }
            });
    }

    function initGroupBy(table: Tabulator) {
        if (Array.isArray(table.options.groupBy)) {
            table.options.groupBy.forEach((field) => {
                if (field) {
                    rowGroups[field] = columns.find((c) => c.field === field)?.groupByFunc;
                    table.getColumn(field)?.getElement()?.classList.add('primary');
                }
            });
            setGroupBy(table);
        }
    }

    function toggleGroup(table: Tabulator, field: string) {
        const element = table.getColumn(field)?.getElement();
        if (!isGroupedBy(field)) {
            rowGroups[field] = columns.find((c) => c.field === field)?.groupByFunc;
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

</script>

<div use:createTabulator></div>
