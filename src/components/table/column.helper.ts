import Color from "color";
import type { CellComponent, ColumnDefinition, ListEditorParams } from "tabulator-tables";

type Sorter = undefined
    | 'string'
    | 'number'
    | 'alphanum'
    | 'boolean'
    | 'exists'
    | 'date'
    | 'time'
    | 'datetime'
    | 'array';

export const column = (title: string, field: string, width: string, sorter: Sorter, ...more: Partial<ColumnDefinition>[]): ColumnDefinition => {
    return Object.assign({
        title,
        field,
        width,
        sorter,
        resizable: true
    }, ...more);
};

export const comboBoxEditor: Partial<ColumnDefinition> = {
    editor: 'list',
    editorParams: {
        valuesLookup: 'active',
        autocomplete: true,
        clearable: true,
        allowEmpty: true,
        listOnEmpty: true,
        freetext: true
    }
};

export const autoFilter: Partial<ColumnDefinition> = {
    headerFilter: 'list',
    headerFilterParams: comboBoxEditor.editorParams
};

export const favColumn: Partial<ColumnDefinition> = {
    hozAlign: 'center',
    headerFilter: "tickCross",
    headerFilterParams: {
        tristate: true
    },
    formatter(cell: CellComponent) {
        const value = cell.getValue();
        const element = cell.getElement();
        element.addEventListener('click', () => cell.setValue(!value));
        element.style.fontSize = 'large';
        element.style.color = value ? 'gold' : 'lightgray';
        return value ? '✮' : '✩';
    }
};

export const progressColumn: Partial<ColumnDefinition> = {
    headerFilter: 'number',
    headerFilterParams: {
        min: 0,
        max: 100,
        step: 5
    },
    formatter: 'progress',
    formatterParams: {
        min: 0,
        max: 100,
        color: [ '#FF0000', '#FFC000', '#00E000' ],
        legend: (v: number) => `${v} %`,
        legendColor:"#000000",
        legendAlign:"center",
    }
};