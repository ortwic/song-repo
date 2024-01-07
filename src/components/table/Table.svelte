<script lang="ts">
  import 'tabulator-tables/dist/css/tabulator_bulma.min.css';
  import { 
    type ColumnDefinition, 
    type GroupComponent, 
    type ColumnComponent, 
    type Options, 
    Tabulator, 
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
    ValidateModule
  } from 'tabulator-tables';
  import { default as ResponsiveLayoutModule, type CollapsedCellData } from './tabulator/modules/ResponsiveLayout';
  import { onMount, createEventDispatcher, onDestroy } from 'svelte';
  import { Observable, fromEvent, map, take } from 'rxjs';
  import { toggleVisibilityItem } from './templates/menu.helper';
  import { tableView } from '../../store/app.store';
  import { orientation, type Orientation } from '../../store/media.store';
  import responsiveCollapse from './tabulator/modules/formatters/responsiveCollapse';

  Tabulator.registerModule([
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
    ValidateModule
  ]);

  Tabulator.extendModule('format', 'formatters', {
    responsiveCollapse
  });

  type T = $$Generic;
  type GroupFormatter = (value: unknown, count: number, data: T[], group?: GroupComponent) => string;

  const rowGroups = {};
  export let idField: keyof T;
  export let columns: ColumnDefinition[] = undefined;
  export let data: Observable<T[]>;
  export let groupBy: string[] = undefined;
  export let placeholder = '';
  export let placeholderSearch = '';
  export let groupHeader: GroupFormatter = undefined;
  export let detailFormatter: (data: CollapsedCellData[]) => HTMLElement = undefined;
  export const isGroupedBy = (field: string) => field in rowGroups;
  export let persistenceID = '';
  let useResponsiveLayout = false;
  let searchTerm = '';
  let table: Observable<Tabulator>;
  let tableContainer: HTMLElement;
  let endOrientation = () => {};

  const dispatch = createEventDispatcher();
  const groupContextMenu = [
    {
      label: 'Open all', // TODO not working
      action() {
        $table.getGroups().forEach(g => g.show());
      }
    },
    {
      label: 'Collapse all', // TODO not working
      action() {
        $table.getGroups().forEach(g => g.hide());
      }
    }
  ];
  
  const usePersistance = !!persistenceID;
  const options: Options = {
    columns,
    placeholder,
    clipboard: true,
    movableColumns: true,
    groupBy,
    groupHeader,
    groupToggleElement: 'header',
    groupUpdateOnCellEdit: true,
    footerElement: '#footer',
    history: true,
    responsiveLayoutCollapseStartOpen: false,
    responsiveLayoutCollapseFormatter: detailFormatter,
    pagination: false,
    persistenceID,
    persistenceMode: 'local',
    persistence: {
      sort: usePersistance,
      filter: usePersistance,
      columns: usePersistance,
      group: usePersistance
    }
  };

  onMount(() => endOrientation = orientation.subscribe(createTable));
  onDestroy(() => {
    $table?.destroy();
    endOrientation();
  });

  function createTable(orientation: Orientation) {
    $table?.destroy();

    useResponsiveLayout = orientation === 'portrait';
    const tableInstance = new Tabulator(tableContainer, {
      ...options,
      layout: useResponsiveLayout ? 'fitDataStretch' : 'fitData',
      headerVisible: !useResponsiveLayout,
      responsiveLayout: useResponsiveLayout ? 'collapse' : undefined
    });
    table = fromEvent(tableInstance, 'tableBuilt').pipe(take(1), map(() => handleTableBuilt(tableInstance)));
  }

  function isRequired(def: ColumnDefinition): boolean {
    if (Array.isArray(def.validator)) {
      return 'required' in def.validator;
    }
    return def.validator === 'required';
  }

  function handleTableBuilt(table: Tabulator) {
    initHeaderMenu(table);
    initGroupBy(table);

    tableView.set({ 
      table,
      groups: Object.keys(rowGroups),
      toggleGroup
    });
    dispatch('init', table);
    return table;
  }

  function initHeaderMenu(table: Tabulator) {
    const columnSelectors = table.getColumns()
      .filter(c => !isRequired(c.getDefinition()))
      .map(column => toggleVisibilityItem(column));

    columns?.filter(c => c.headerMenu).forEach(c => {
      if (c.headerMenu.length) {
        c.headerMenu.length = 0;
      }
      c.headerMenu.push({
        label: `Group by ${c.title.toLowerCase()}`,
        action: (ev: Event, column: ColumnComponent) => toggleGroup(c.field, column.getElement())
      }, { separator: true }, {
        label: 'Choose columns',
        menu: [ ...columnSelectors ]
      });
    });
  }

  function initGroupBy(table: Tabulator) {
    if (Array.isArray(table.options.groupBy)) {
      table.options.groupBy.forEach(field => {
        rowGroups[field] = true;
        table.getColumn(field).getElement()?.classList.add('primary');
      });
    }
  }

  function toggleGroup(field: string, element?: HTMLElement) {
    if (!isGroupedBy(field)) {
      rowGroups[field] = true;
      element?.classList.add('primary');
    } else {
      delete rowGroups[field];
      element?.classList.remove('primary');
    }
    const groups = Object.keys(rowGroups);
    $table.setGroupBy(groups.length ? groups : undefined);
  }

  function search() {
    if (searchTerm) {
      // 2nd level array enforces OR comparison
      $table.setFilter([columns
        .filter(c => c.sorter === 'string')
        .map(c => ({ field: c.field, type: 'like', value: searchTerm }))
      ]);
    } else {
      $table.clearFilter(true);
    }
  }

  $: setData($table, $data);

  async function setData(table: Tabulator, data: T[]): Promise<void> {
    const areEquivalent = (source: T[]) => {
      return source.length === data.length
        && source.every(item => data.map((v: T) => v[idField]).indexOf(item[idField]) > -1);
    }

    if (table && data) {
      if (data.length && idField && areEquivalent(table.getData())) {
        await table.updateData(data);
        console.debug('upd', data.length);
      } else {
        await table.setData(data);
        console.debug('set', data.length);
      }
    }
  }
</script>

<span class="menu {useResponsiveLayout ? 'responsive' : 'static'}">
  <div class="section">
    <slot name="header"></slot>
    <input type="search" placeholder={placeholderSearch} autocomplete="off" bind:value={searchTerm} on:input={search}/>
  </div>
</span>

<div id="table" bind:this={tableContainer}>
</div>
<span id="footer">
  <slot name="footer"></slot>
</span>

<style lang="scss">
  .menu {
    &.static {
      display: none;
    }

    &.responsive {
      display: inline;
    }

    .section {
      display: flex;

      input[type=search] {
        width: 100%;
      }
    }
  }

  #table {
    overflow: auto;
    width: 100%;
    height: 100%;
    max-height: 100%;
    overflow: hidden;
  }

  #footer {
    width: 100%;
  }
</style>
  