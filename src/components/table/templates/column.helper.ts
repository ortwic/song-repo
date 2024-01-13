import type { CellEditEventCallback, ColumnComponent, ColumnDefinition, Editor, ListEditorParams, RowComponent, SortDirection } from 'tabulator-tables';
import { autoFilter } from './filter.helper';
import Format from './Formatter.class';
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
    responsive: number,
    field: string,
    width: string,
    sorter: Sorter,
    format: keyof Format,
    ...more: Partial<ColumnDefinition>[]
): ColumnDefinition => {
    const title = typeof t === 'string' ? t : t(`songs.columns.${field}`);
    return Object.assign(
        {
            title,
            field,
            width,
            sorter,
            responsive,
            resizable: true,
            headerMenu: [],
        },
        Format.get(format),
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
                def.formatter = Format.get('label').formatter;
            }
            return def as ColumnDefinition;
        };
        if (total) {
            return Object.keys(data[0]).map(column);
        }
    }
};

export function createEditor(cellEdited: CellEditEventCallback, readonly = false) {  
    const listParams = (values?: string[]) => {
        const editorParams: ListEditorParams = {
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
        return editorParams;
    };

    return (editor?: Editor, values?: string[]): Partial<ColumnDefinition> => {
        if (!readonly) {
            const definition: Partial<ColumnDefinition> = {
                editor,
                cellEdited
            };
            if (editor === 'list') {
                definition.editorParams = listParams(values);
            }
            return definition;
        }
    };
}
