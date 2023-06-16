import Color from "color";
import type { ColumnDefinition, CellComponent } from "tabulator-tables";
import genres from '../../data/genres.json';
import colornames from '../../data/colornames.json';

export const genreFormatter: Partial<ColumnDefinition> = {
    formatter(cell: CellComponent): string {
        const value = cell.getValue();
        try {
            const hexcolor = genres[value] && colornames[genres[value].toLowerCase()];
            if (hexcolor) {
                const color = Color(hexcolor).isDark() ? 'white' : 'black';
                const element = cell.getElement();
                element.style.color = color;
                element.style.backgroundColor = hexcolor;
            }
        } catch {      
        }
        return value;
    }
};

export const labelFormatter: Partial<ColumnDefinition> = {
    formatter(cell: CellComponent): string {
        const value = cell.getValue().toString();
        if (value) {
            return value.split(',').map(v => `<span class='label'>${v}</span>`).join('');
        }
    }
};

export const statusFormatter: Partial<ColumnDefinition> = {
    hozAlign: 'center',
    formatter(cell: CellComponent): string {
        const value = cell.getValue().toString();
        const element = cell.getElement();
        element.classList.add('status', value);
        return `<span style='display:none'>${value}</span>`;
    }
};
