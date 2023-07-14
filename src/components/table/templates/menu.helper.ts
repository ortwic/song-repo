import type { ColumnComponent, MenuObject } from 'tabulator-tables';

export const toggleVisibilityItem = (column: ColumnComponent): MenuObject<ColumnComponent> => {
    const label = document.createElement('span');
    label.classList.add(column.isVisible() ? 'fa-check-square' : 'fa-square');
    label.textContent = column.getDefinition().title;
    return {
        label,
        action() {
            column.toggle();
            if (column.isVisible()) {
                label.classList.replace('fa-square', 'fa-check-square');
            } else {
                label.classList.replace('fa-check-square', 'fa-square');
            }
        },
    };
};
