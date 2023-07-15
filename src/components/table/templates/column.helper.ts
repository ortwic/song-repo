import type { ColumnDefinition, EditorParams } from 'tabulator-tables';
import { autoFilter } from './filter.helper';
import { labelFormatter } from './formatter.helper';

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
    sorter: Sorter = 'string',
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

export const autoColumns = <T>(data: T[]) => {
    const column = (key: string) => {
        const def = {
            title: key,
            field: key,
            width: `${100 / Object.keys(data[0]).length}%`,
            editor: 'input',
            ...autoFilter(),
        };
        if (Array.isArray(data[0][key])) {
            def.formatter = labelFormatter.formatter;
        }
        return def;
    };
    if (data.length && Object.keys(data[0]).length) {
        return Object.keys(data[0]).map(column);
    }
};

export const comboBoxEditor = (values?: string[]): Partial<ColumnDefinition> => {
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
