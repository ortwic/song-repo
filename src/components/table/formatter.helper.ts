import Color from "color";
import type { ColumnDefinition, CellComponent } from "tabulator-tables";
import genres from '../../data/genres.json';
import colornames from '../../data/colornames.json';

export const favColumn: Partial<ColumnDefinition> = {
    hozAlign: 'center',
    headerFilter: "tickCross",
    headerFilterParams: {
        tristate: true
    },
    formatter(cell: CellComponent) {
        const value = cell.getValue();
        const element = cell.getElement();
        element.addEventListener('click', () => cell.setValue(!value));
        element.classList.add('fav');
        if (value) {
            element.classList.add('active');
            return '✮';
        }
        return '✩';
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

export const progressFormatter: Partial<ColumnDefinition> = {
    formatter: 'progress',
    formatterParams: {
        min: 0,
        max: 100,
        color: [ '#FF0000', '#FFC000', '#00E000' ],
        legend: (v: number) => `${v} %`,
        legendColor:"#000000",
        legendAlign:"center",
    }
};

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
