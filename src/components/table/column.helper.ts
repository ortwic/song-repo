import type { ColumnDefinition, EditorParams } from 'tabulator-tables';

type Sorter =
    | undefined
    | 'string'
    | 'number'
    | 'alphanum'
    | 'boolean'
    | 'exists'
    | 'date'
    | 'time'
    | 'datetime'
    | 'array';

export const column = (
    title: string,
    field: string,
    width: string,
    sorter: Sorter,
    ...more: Partial<ColumnDefinition>[]
): ColumnDefinition => {
    return Object.assign(
        {
            title,
            field,
            width,
            sorter,
            resizable: true,
            headerMenu: [],
        },
        ...more
    );
};

export const comboBoxEditor = (
    values?: string[]
): Partial<ColumnDefinition> => {
    const editorParams: EditorParams = {
        values,
        autocomplete: true,
        clearable: true,
        allowEmpty: true,
        listOnEmpty: true,
        freetext: true,
    };
    if (!values) {
        editorParams.valuesLookup = 'active';
    }
    return { editor: 'list', editorParams };
};
