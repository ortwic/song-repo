import { t } from 'svelte-i18n';
import { get } from 'svelte/store';
import type { ColumnDefinition, FilterType, ListEditorParams } from 'tabulator-tables';
import { STATUS_KEYS } from '../../../model/app.types';

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

    return {
        headerFilter: minMaxFilterEditorElement,
        headerFilterParams: { min, max, step },
        headerFilterFunc: minMaxFilterFunction,
    };
};

export const hasValueFilter = (
    labels: [hasLabel: string, noneLabel: string, allLabel: string],
): Partial<ColumnDefinition> => {
    type TriState = 'has' | 'none' | undefined;
    const [hasLabel, noneLabel, allLabel] = labels;

    const nextState = (current: TriState): TriState => {
        if (current === undefined) {
            return 'has';
        }
        if (current === 'has') {
            return 'none';
        }
        return undefined;
    };

    const labelFor = (state: TriState): string => {
        if (state === 'has') {
            return hasLabel;
        }
        if (state === 'none') {
            return noneLabel;
        }
        return allLabel;
    };

    const hasValueFilterEditorElement = (cell, _onRendered, success, cancel, _editorParams) => {
        const button = document.createElement('button');
        button.style.padding = '4px';
        button.style.width = '100%';
        button.style.boxSizing = 'border-box';

        let state: TriState = undefined;
        button.innerHTML = labelFor(state);

        button.addEventListener('click', () => {
            state = nextState(state);
            button.innerHTML = labelFor(state);
            success(state);
        });

        button.addEventListener('keydown', (ev: KeyboardEvent) => {
            if (ev.key === 'Enter' || ev.key === ' ') {
                ev.preventDefault();
                state = nextState(state);
                button.innerHTML = labelFor(state);
                success(state);
            }
            if (ev.key === 'Escape') {
                cancel();
            }
        });

        return button;
    };

    /**
     * custom hasValue filter function
     * @param headerValue - 'has' = nur Zeilen mit Wert, 'none' = nur Zeilen ohne Wert, undefined = kein Filter
     * @param rowValue - the value of the column in this row
     * @returns must return a boolean, true if it passes the filter.
     */
    function hasValueFilterFunction(headerValue: TriState, rowValue: unknown) {
        if (headerValue === undefined) {
            return true;
        }
        const rowHasValue = rowValue !== undefined && rowValue !== null && rowValue !== '';
        return headerValue === 'has' ? rowHasValue : !rowHasValue;
    }

    return {
        headerFilter: hasValueFilterEditorElement,
        headerFilterFunc: hasValueFilterFunction,
    };
};