<script lang="ts">
  import 'tabulator-tables/dist/css/tabulator_bulma.min.css';
  import { TabulatorFull } from 'tabulator-tables';
  import type { ColumnDefinition, GroupComponent, ColumnComponent, RowComponent } from 'tabulator-tables';
  import { onMount, createEventDispatcher, onDestroy } from 'svelte';
  import { Observable, fromEvent, map, take } from 'rxjs';
  import { toggleVisibilityItem } from './templates/menu.helper';
  import { downloadQueue, type DowloadItem } from '../../store/download.store';
  import { showError } from '../../store/notification.store';

  type GroupFormatter<T> = (value: unknown, count: number, data: T[], group?: GroupComponent) => string;

  const rowGroups = {};
  export let columns: ColumnDefinition[] = undefined;
  export let data: unknown[] = undefined;
  export let placeholder = '';
  export let exportTitle = 'export';
  export let groupHeader: GroupFormatter<unknown> = undefined;
  export const isGroupedBy = (field: string) => field in rowGroups;
  export let usePersistance = true;
  let table: Observable<TabulatorFull>;
  let tableContainer: HTMLElement;
  let unsubscribe = () => {};

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

  type CollapsedCellData = { field: string, title: string, value: string };
  
  const responsiveLayoutCollapseFormatter = (data: CollapsedCellData[]) => {
    //data - an array of objects containing the column title and value for each cell
    if (Object.keys(data).length) {
      
      const list = document.createElement("div");
      list.classList.add('flex');

      data.forEach(({ title, value }) => {
          let item = document.createElement("div");
          item.innerHTML = `<label>${title}</label><br/>${value}`;
          list.appendChild(item);
      });
      return list;
    }
    return "";
  };
  
  onMount(() => {
    const tableInstance = new TabulatorFull(tableContainer, {
      columns: [ 
        { title: '', formatter: "responsiveCollapse" , width:30, minWidth:30, hozAlign:"center", resizable:false, headerSort:false },
        ...columns 
      ],
      data,
      layout: 'fitData',
      responsiveLayout: 'collapse',
      responsiveLayoutCollapseStartOpen: false,
      responsiveLayoutCollapseFormatter,
      placeholder,
      clipboard: true,
      movableColumns: true,
      pagination: false,
      groupHeader,
      groupToggleElement: 'header',
      groupUpdateOnCellEdit: true,
      footerElement: '#footer',
      persistenceID: columns.map(c => c.field[0]).join(''),
      persistence: {
        sort: usePersistance,
        filter: usePersistance,
        columns: usePersistance,
        group: usePersistance
      },
      locale: 'en-us',
      langs: {
        'en-us': {
          pagination: {
            'page_size': '',
            'first': '<<',
            'last': '>>',
            'prev': '<',
            'next': '>',
          }
        }
      }
    });
    
    table = fromEvent(tableInstance, 'tableBuilt').pipe(take(1), map(() => handleTableBuilt(tableInstance)));
  });

  onDestroy(() => {
    unsubscribe();
    $table?.destroy();
  });

  function isRequired(def: ColumnDefinition): boolean {
    if (Array.isArray(def.validator)) {
      return 'required' in def.validator;
    }
    return def.validator === 'required';
  }

  function handleTableBuilt(table: TabulatorFull) {
    const columnSelectors = table.getColumns()
      .filter(c => !isRequired(c.getDefinition()))
      .map(column => toggleVisibilityItem(column));
    
    columns?.filter(c => c.headerMenu).forEach(c => c.headerMenu.push({
      label: `Group by ${c.title.toLowerCase()}`,
      action: (ev: Event, column: ColumnComponent) => toggleGroup(c.field, column.getElement())
    }, { separator: true }, {
      label: 'Choose columns',
      menu: [ ...columnSelectors ]
    }));

    unsubscribe = downloadQueue.subscribe((items) => download(table, items));
    dispatch('init', table);
    return table;
  }

  export async function addRow<T>(data: T): Promise<RowComponent> {
    try {
      return $table.addRow(data);
    } catch (error) {
      showError(`Tabulator is unable to add a new row!\n${error.message}`);
    }
  }

  export async function focusField(row: RowComponent, field: string): Promise<void> {
    await row.scrollTo();
    if (field) {
      const cell = row.getCell(field);
      if (cell.getColumn().isVisible()) {
        // TODO if not visible focus next
        cell.edit();
      }
    }
  }

  export async function setData<T>(data: T[], idField?: keyof T): Promise<void> {
    const areEquivalent = (source: T[]) => {
      return source.length === data.length
        && source.every(item => data.map((v: T) => v[idField]).indexOf(item[idField]) > -1);
    }

    if ($table && data) {
      if (data.length && idField && areEquivalent($table.getData())) {
        await $table.updateData(data);
        console.debug('upd', data.length);
      } else {
        await $table.setData(data);
        console.debug('set', data.length);
      }
    }      
  }

  export function toggleGroup(field: string, element?: HTMLElement) {
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

  function download(table: TabulatorFull, items: DowloadItem[]): void {
    if (items?.length) {
      try {
        const { type, params } = items.pop();
        table.download(type, `${exportTitle}.${type}`, params);
      } catch (error) {
        showError(error.message);
      }
    }
  }
</script>

<div id="table" bind:this={tableContainer}>
</div>
<span id="footer">
  <slot name="footer"></slot>
</span>

<style>
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
  