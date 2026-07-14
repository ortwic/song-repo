import type { Editor } from "tabulator-tables";

export const arrayInputEditor: Editor = (cell, onRendered, success, cancel) => {
    const initialValue = (cell.getValue() as string[] | undefined) ?? [];
    let initialText = initialValue.join(', ');

    const input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.style.padding = '4px';
    input.style.width = '100%';
    input.style.boxSizing = 'border-box';
    input.value = initialText;

    onRendered(() => {
        input.focus();
    });

    function onChange() {
        if (input.value === initialText) {
            cancel(undefined);
            return;
        }

        const values = input.value
            .split(',')
            .map(entry => entry.trim())
            .filter(entry => entry.length > 0);

        if (success(values)) {
            // prevent multiple change/blur-Event invokations from tabulator
            initialText = input.value;
        }
    }

    input.addEventListener('change', onChange);
    input.addEventListener('blur', onChange);
    input.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            onChange();
        } else if (e.key === 'Escape') {
            cancel(undefined);
        }
    });

    return input;
};