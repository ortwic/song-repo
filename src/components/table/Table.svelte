<script lang="ts">
  import 'tabulator-tables/dist/css/tabulator_bulma.min.css';
  import { TabulatorFull } from 'tabulator-tables';
  import type { ColumnDefinition, DownloadOptions, DownloadType, GroupComponent, ColumnComponent, RowComponent } from 'tabulator-tables';
  import { onMount, createEventDispatcher } from 'svelte';
  import { Observable, fromEvent, map, take } from 'rxjs';
  import { toggleVisibilityItem } from './menu.helper';
  import { showError } from '../../store/notification.store';

  type GroupFormatter<T> = (value: unknown, count: number, data: T[], group?: GroupComponent) => string;

  const rowGroups = {};
  export let columns: ColumnDefinition[];
  export let placeholder = '';
  export let exportTitle = 'export';
  export let groupHeader: GroupFormatter<unknown> = undefined;
  export const isGroupedBy = (field: string) => field in rowGroups;
  let table: Observable<TabulatorFull>;
  let tableContainer: HTMLElement;

  const dispatch = createEventDispatcher();
  const rowContextMenu = [
    {
      label: "<span class='fa-check-square'>Select Row</span>",
      action(ev: Event, row: RowComponent){
        if (row.isSelected()) {
          row.deselect();
        } else {
          row.select();
        }
      }
    },
    {
      label: "Advanced",
      menu: [
        {
          label: "<span class='fa-trash'> Delete Row</span>",
          action(ev: Event, row: RowComponent) {
            row.delete();
            dispatch('deleteRow', row.getData());
          }
        }
      ]
    },
    {
      separator: true
    },
    {
      label: "Export as CSV",
      action: () => download('csv', { delimiter: ';' })
    },
    {
      label: "Export as JSON",
      action: () => download('json')
    },
    {
      label: "Export as XLSX",
      action: () => download('xlsx', { sheetName: exportTitle })
    },
    {
      label: "Export as PDF",
      action: () => download('pdf', { title: exportTitle })
    }
  ];
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

  onMount(() => {
    const tableInstance = new TabulatorFull(tableContainer, {
      columns,
      placeholder,
      index: 'id',
      clipboard: true,
      movableColumns: true,
      rowContextMenu,
      pagination: false,
      groupHeader,
      groupToggleElement: 'header',
      groupUpdateOnCellEdit: true,
      footerElement: '#footer',
      persistence: {
        sort: true,
        filter: true,
        columns: true,
        group: true
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
    
    columns.filter(c => c.headerMenu).forEach(c => c.headerMenu.push({
      label: `Group by ${c.title.toLowerCase()}`,
      action: (ev: Event, column: ColumnComponent) => toggleGroup(c.field, column.getElement())
    }, { separator: true }, ...columnSelectors));

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

  export async function setData<T>(data: T): Promise<void> {
    if ($table) {
      return $table.setData(data);
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

  function download(downloadType: DownloadType, params?: DownloadOptions): void {
    if ($table) {
      try {
        $table.download(downloadType, `${exportTitle}.${downloadType}`, params);
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
  