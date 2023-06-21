import type { ColumnDefinition } from "tabulator-tables";

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
