import Color from "color";
import type { ColumnDefinition, CellComponent } from "tabulator-tables";
import ProgressBar from "./templates/ProgressBar.class";
import genres from '../../data/genres.json';
import colornames from '../../data/colornames.json';
import type { Song } from "../../model/song.model";

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
    formatter(cell: CellComponent): HTMLElement {
        const song = cell.getData() as Song;
        const bar = ProgressBar.create(cell.getElement(), cell.getValue());
        bar.element.addEventListener('change', (ev: CustomEvent) => {
            const [newValue, oldValue] = ev.detail;
            cell.setValue(newValue);

            if (newValue > 99) {
                song.status = 'done';
            } else if (newValue < 1) {
                song.status = 'removed';
            } else if (newValue < oldValue) {
                song.status = 'repeat';
            } else if (oldValue < newValue) {
                song.status = 'wip';
            }
            console.log({ [song.status]: ev.detail.join() });
        });
        return bar.element;
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
