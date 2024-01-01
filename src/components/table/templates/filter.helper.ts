import type { ColumnDefinition, FilterType } from 'tabulator-tables';

export const autoFilter = (operator: FilterType = 'like'): Partial<ColumnDefinition> => {
    return {
        headerFilter: 'list',
        headerFilterParams: {
            valuesLookup: 'active',
            autocomplete: true,
            clearable: true,
            allowEmpty: true,
            listOnEmpty: true,
            freetext: true,
        },
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

// copied from example // https://tabulator.info/examples/5.5#filter-header
const minMaxFilterEditorElement = (cell, _onRendered, success, cancel, editorParams) => {
    const container = document.createElement('span');

    //create and style inputs
    const start = document.createElement('input');
    start.setAttribute('type', 'number');
    start.setAttribute('placeholder', 'Min');
    start.setAttribute('min', editorParams.min);
    start.setAttribute('max', editorParams.max);
    start.setAttribute('step', editorParams.step);
    start.setAttribute('value', editorParams.min);
    start.style.padding = '4px';
    start.style.width = '50%';
    start.style.boxSizing = 'border-box';

    start.value = cell.getValue();

    const end = start.cloneNode() as HTMLInputElement;
    end.setAttribute('placeholder', 'Max');
    end.setAttribute('value', editorParams.max);

    start.addEventListener('change', buildValues);
    start.addEventListener('blur', buildValues);
    start.addEventListener('keydown', keypress);

    end.addEventListener('change', buildValues);
    end.addEventListener('blur', buildValues);
    end.addEventListener('keydown', keypress);

    function buildValues() {
        success({ start: start.value, end: end.value });
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

interface HeaderMinMaxValue {
    start?: number;
    end?: number;
}

/**
 * custom max min filter function
 * @param headerValue - the value of the header filter element
 * @param rowValue - the value of the column in this row
 * @param rowData - the data for the row being filtered
 * @param filterParams - params object passed to the headerFilterFuncParams property
 * @returns must return a boolean, true if it passes the filter.
 */
function minMaxFilterFunction(headerValue: HeaderMinMaxValue, rowValue: number) {
    const hasValue = <T>(value: T) => value === 0 || value;
    
    if (hasValue(rowValue)) {
        if (hasValue(headerValue.start)) {
            if (hasValue(headerValue.end)) {
                return +rowValue >= headerValue.start && +rowValue <= headerValue.end;
            } else {
                return +rowValue >= headerValue.start;
            }
        } else if (hasValue(headerValue.end)) {
            return +rowValue <= headerValue.end;
        }
    }

    return true;
}
