import type { ColumnComponent, ColumnDefinition, EditorParams, RowComponent, SortDirection } from 'tabulator-tables';
import { autoFilter } from './filter.helper';
import { labelFormatter } from './formatters/formatter.helper';
import type { MessageFormatter } from '../../../service/i18n';

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
    | 'array'
    | (<T>(
        a: T,
        b: T,
        aRow: RowComponent,
        bRow: RowComponent,
        column: ColumnComponent,
        dir: SortDirection,
        sorterParams: NonNullable<unknown>,
    ) => number);

export const column = (
    t: string | MessageFormatter,
    field: string,
    width: string,
    sorter: Sorter,
    ...more: Partial<ColumnDefinition>[]
): ColumnDefinition => {
    const title = typeof t === 'string' ? t : t(`songs.columns.${field}`);
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

export const autoColumns = <T>(data: T[]): ColumnDefinition[] => {
    if (data.length) {
        const total = Object.keys(data[0]).length;
        const column = (key: string) => {
            const def = {
                title: key,
                field: key,
                width: total < 6 ? `${100 / total}%` : '18%',
                editor: 'input',
                resizable: true,
                ...autoFilter(),
            };
            if (Array.isArray(data[0][key])) {
                def.formatter = labelFormatter.formatter;
            }
            return def as ColumnDefinition;
        };
        if (total) {
            return Object.keys(data[0]).map(column);
        }
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
