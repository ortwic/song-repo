import Color from 'color';
import { marked } from 'marked';
import { Timestamp } from 'firebase/firestore';
import type { ColumnDefinition, CellComponent } from 'tabulator-tables';
import '../ProgressBar.class';
import genres from '../../../../data/genres.json';
import colornames from '../../../../data/colornames.json';
import type { UserSong } from '../../../../model/song.model';
import { redToGreenGradient, redToGreenRange } from '../../../../styles/style.helper';

export const favColumn: Partial<ColumnDefinition> = {
    hozAlign: 'center',
    headerFilter: 'tickCross',
    headerFilterParams: {
        tristate: true,
    },
    formatter(cell: CellComponent) {
        const value = cell.getValue();
        const element = cell.getElement();
        element.addEventListener('click', () => cell.setValue(!value));
        element.classList.add('fav');
        if (value) {
            element.title = 'favorite';
            element.classList.add('active');
        } else {
            element.classList.remove('active');
        }
        return `<span style='display:none'>${value}</span>`;
    },
    formatterParams: { hideTitle: true }
};

export const lengthFormatter: Partial<ColumnDefinition> = {
    formatter: (cell: CellComponent): string => cell.getValue()?.length,
    formatterParams: { hideTitle: true }
};

export const bgImgFormatter: Partial<ColumnDefinition> = {
    formatter(cell: CellComponent) {
        const url = cell.getValue();
        if (url) {
            const element = cell.getElement();
            element.style.backgroundImage = `url(${url})`;
            element.style.backgroundRepeat = 'no-repeat';
            element.style.backgroundPosition = 'center';
            element.style.backgroundSize = 'cover';
        }
        return '';
    },
    formatterParams: { hideTitle: true }
};

export const statusFormatter: Partial<ColumnDefinition> = {
    formatter(cell: CellComponent): HTMLElement | string {
        const value = cell.getValue().toString();
        const element = cell.getElement();
        element.title = value;
        element.classList.add('status', value);
        if (cell.getData()['uri']) {
            element.classList.add('resource', value);
        }
        return `<span style='display:none'>${value}</span>`;
    },
};

export const urlFormatter: Partial<ColumnDefinition> = {
    formatter(cell: CellComponent) {
        const resource = cell.getValue();
        if (resource) {
            const a = document.createElement('a');
            a.setAttribute('href', resource);
            a.setAttribute('target', '_blank');
            try {
                const url = new URL(resource);
                a.text = `${url.hostname}${url.pathname}${url.search ?? url.hash}`;
            } catch (error) {
                a.text = resource;
            }
            return a;
        }
    },
    formatterParams: { hideTitle: true }
};

export const progressFormatter: Partial<ColumnDefinition> = {
    formatter(cell: CellComponent): HTMLElement | string {
        const song = cell.getData() as UserSong;
        const bar = document.createElement('progress-bar');
        bar.setAttribute('value', cell.getValue());
        bar.addEventListener('change', (ev: CustomEvent<number[]>) => {
            const [newValue, oldValue] = ev.detail;
            cell.setValue(newValue);

            if (newValue > 90) {
                song.status = 'done';
            } else if (newValue < 10) {
                song.status = 'archived';
            } else if (newValue < oldValue) {
                song.status = 'repeat';
            } else if (oldValue < newValue) {
                song.status = 'wip';
            }
        });
        return bar;
    },
};

export const difficultyFormatter: Partial<ColumnDefinition> = {
    hozAlign: 'center',
    headerFilter: 'number',
    headerFilterParams: {
        min: 1, 
        max: 10
    },
    formatter(cell: CellComponent): HTMLElement {
        const value = cell.getValue();
        if (value) {
            const element = cell.getElement();
            const [ gradient ] = redToGreenGradient((10 - value) * 10, 'to left', .2);
            element.style.background = gradient;
        }
        return value;
    },
    editor: 'number',
    editorParams: { 
        min: 1, 
        max: 10 
    }
};

export const genreFormatter: Partial<ColumnDefinition> = {
    formatter(cell: CellComponent): string {
        const value = cell.getValue()?.toLowerCase();
        try {
            const color = genres.find((v) => v.name.toLowerCase() == value)?.color;
            const bgColor = color && colornames[color.toLowerCase()];
            if (bgColor) {
                const element = cell.getElement();
                element.style.color = Color(bgColor).isDark() ? 'white' : 'black';
                element.style.backgroundColor = bgColor;
            }
        } catch { /* empty */ }
        return value;
    },
};

export const markedFormatter: Partial<ColumnDefinition> = {
    formatter(cell: CellComponent): string {
        const value = cell.getValue();
        return value ? marked(value, { mangle: false, headerIds: false }) : value;
    },
};

export const labelFormatter: Partial<ColumnDefinition> = {
    formatter(cell: CellComponent): string {
        const value = cell.getValue();
        if (value?.length) {
            return value
                .toString()
                .split(',')
                .map((v) => `<span class='label'>${v}</span>`)
                .join('');
        }
    },
};

export const timestampFormatter: Partial<ColumnDefinition> = {
    formatter(cell: CellComponent): string {
        const value = cell.getValue();
        if (value instanceof Timestamp) {
            return `${value.toDate()?.getFullYear()}`;
        }
        if (value?.seconds) {
            return `${new Date(value.seconds).getFullYear()}`;
        }
        return `${value}`;
    },
};

export const groupByFormatter = (value: unknown, count: number, data: UserSong[]) => {
    const sumUp = (accumulator: number, current: number) => accumulator + current;
    let info = `<span class='label' style='min-width: 2em'>Σ ${count}</span>`;
    if (data.length) {
        const tags = [...new Set(data.flatMap((f) => f.tags || []))];
        const avg = count > 0 ? data.map((f) => +f.progress).reduce(sumUp) / count : 0;
        const bgColor = redToGreenRange(avg);
        const color = bgColor.isDark() ? 'white' : 'black';
        const style = `min-width: 3em;background-color:${bgColor.hex()};color:${color}`;
        info += `<span class='label m10' style='${style}'>Ø ${avg.toFixed()}%</span>
            ${tags.map((t) => `<span class='label'>${t}</span>`).join('')}`;
    }
    return `<span class='title'>${value || 'n/a'}</span>${info}`;
};

export default {
    favColumn,
    bgImg: bgImgFormatter,
    length: lengthFormatter,
    progress: progressFormatter,
    difficulty: difficultyFormatter,
    genre: genreFormatter,
    marked: markedFormatter,
    label: labelFormatter,
    status: statusFormatter,
    url: urlFormatter,
    timestamp: timestampFormatter,
    groupBy: groupByFormatter,
};
