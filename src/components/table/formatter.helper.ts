import Color from "color";
import type { CellComponent } from "tabulator-tables";
import { Status } from '../../model/types';
import genres from '../../data/genres.json';
import colornames from '../../data/colornames.json';

export const favFormatter = (cell: CellComponent) => {
    const value = cell.getValue();
    const element = cell.getElement();
    element.style.fontSize = 'large';
    element.style.color = value ? 'gold' : 'lightgray';
    return value ? '✮' : '✩';
};

export const progressFormatter = {
    min: 0,
    max: 100,
    color: [ '#FF0000', '#FFC000', '#00E000' ],
    legend: (v: number) => `${v} %`,
    legendColor:"#000000",
    legendAlign:"center",
};

export const genreFormatter  = (cell: CellComponent) => {
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
};

export const statusMutator = (value: any) => {
    return {
        Unknown: "?",
        Todo: " ",
        Wip: ">",
        Done: "✓",
        Repeat: "<",
        Removed: "✗",
    }[isNaN(value) ? value : `${Status[value]}`];
};