import { t } from 'svelte-i18n';
import { get } from 'svelte/store';
import type { ColumnDefinition, FilterType, ListEditorParams } from 'tabulator-tables';
import { STATUS_KEYS } from '../../../model/types';

type AutoFilterParams = ListEditorParams & {
    operator?: ColumnDefinition['headerFilterFunc'];
};

const DEFAULT_AUTOFILTER: AutoFilterParams = {
    operator: 'like',
    valuesLookup: 'active',
    autocomplete: true,
    clearable: true,
    allowEmpty: true,
    listOnEmpty: true,
    freetext: true
};

export const autoFilter = (params = DEFAULT_AUTOFILTER): Partial<ColumnDefinition> => {
    return {
        headerFilter: 'list',
        headerFilterParams: params,
        headerFilterFunc: params.operator,
    };
};

export const statusFilter = (): Partial<ColumnDefinition> => {
    const translate = (key: string) => get(t)(key);
    return {
        headerFilter: 'list',
        headerFilterParams: { 
            values: STATUS_KEYS,
            itemFormatter: (_, value) => `<i class="status ${value}"></i> ${translate('songs.status.' + value)}`,
        },
        headerFilterFunc: '='
    };
};

export const dateFilter = (operator: FilterType = 'like'): Partial<ColumnDefinition> => {
    return {
        headerFilter: 'date',
        headerFilterFunc: operator as FilterType,
    };
};

export const rangeFilter = (min = 0, max = 100, step = 5): Partial<ColumnDefinition> => {
    return {
        headerFilter: minMaxFilterEditorElement,
        headerFilterParams: { min, max, step },
        headerFilterFunc: minMaxFilterFunction,
    };
};

const getMinMax = (value: string) => (value?.split('-') ?? []);

// copied from example // https://tabulator.info/examples/5.5#filter-header
const minMaxFilterEditorElement = (cell, _onRendered, success, cancel, editorParams) => {
    const container = document.createElement('span');
    const [min, max] = getMinMax(cell.getValue());

    //create and style inputs
    const start = document.createElement('input');
    start.setAttribute('type', 'number');
    start.setAttribute('placeholder', 'Min');
    start.setAttribute('min', editorParams.min);
    start.setAttribute('max', editorParams.max);
    start.setAttribute('step', editorParams.step);
    start.setAttribute('value', min);
    start.style.padding = '4px';
    start.style.width = '50%';
    start.style.boxSizing = 'border-box';
    
    const end = start.cloneNode() as HTMLInputElement;
    end.setAttribute('placeholder', 'Max');
    end.setAttribute('value', max);

    start.addEventListener('change', buildValues);
    start.addEventListener('blur', buildValues);
    start.addEventListener('keydown', keypress);

    end.addEventListener('change', buildValues);
    end.addEventListener('blur', buildValues);
    end.addEventListener('keydown', keypress);

    function buildValues() {
        success(start.value || end.value ? `${start.value}-${end.value}` : undefined);
    }

    function keypress(ev: KeyboardEvent) {
        if (ev.key == 'Enter') {
            buildValues();
        }

        if (ev.key == 'Esc') {
            cancel();
        }
    }

    container.appendChild(start);
    container.appendChild(end);

    return container;
};

/**
 * custom max min filter function
 * @param headerValue - the value of the header filter element
 * @param rowValue - the value of the column in this row
 * @param rowData - the data for the row being filtered
 * @param filterParams - params object passed to the headerFilterFuncParams property
 * @returns must return a boolean, true if it passes the filter.
 */
function minMaxFilterFunction(headerValue: string, rowValue: number) {
    const hasValue = <T>(value: T) => value === 0 || value;
    
    if (hasValue(rowValue)) {
        const [start, end] = getMinMax(headerValue);
        if (hasValue(start)) {
            if (hasValue(end)) {
                return +rowValue >= +start && +rowValue <= +end;
            } else {
                return +rowValue >= +start;
            }
        } else if (hasValue(+end)) {
            return +rowValue <= +end;
        }
    }

    return true;
}
