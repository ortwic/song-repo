import Color from 'color';
import { marked } from 'marked';
import { Timestamp } from 'firebase/firestore';
import type { ColumnDefinition, CellComponent, GroupComponent } from 'tabulator-tables';
import ProgressBar from './ProgressBar.class';
import genres from '../../../data/genres.json';
import colornames from '../../../data/colornames.json';
import type { UserSong } from '../../../model/song.model';
import { redToGreenGradient } from '../../../styles/style.helper';

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
            return '✮';
        }
        return '✩';
    },
};

export const statusFormatter: Partial<ColumnDefinition> = {
    hozAlign: 'center',
    formatter(cell: CellComponent): string {
        const value = cell.getValue().toString();
        const element = cell.getElement();
        element.title = value;
        element.classList.add('status', value);
        return `<span style='display:none'>${value}</span>`;
    },
};

export const progressFormatter: Partial<ColumnDefinition> = {
    formatter(cell: CellComponent): HTMLElement | string {
        const song = cell.getData() as UserSong;
        const bar = ProgressBar.create(cell.getValue());
        bar.element.addEventListener('change', (ev: CustomEvent) => {
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
            console.log({ [song.status]: ev.detail.join() });
        });
        return bar.element;
    },
};

export const genreFormatter: Partial<ColumnDefinition> = {
    formatter(cell: CellComponent): string {
        const value = cell.getValue();
        try {
            const color = genres.find((v) => v.name == value)?.color;
            const bgColor = color && colornames[color.toLowerCase()];
            if (bgColor) {
                const element = cell.getElement();
                element.style.color = Color(bgColor).isDark() ? 'white' : 'black';
                element.style.backgroundColor = bgColor;
            }
        } catch {}
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
        return value;
    },
};


export const groupByFormatter = (value: unknown, count: number, data: UserSong[], group: GroupComponent) => {
    const sumUp = (accumulator: number, current: number) => accumulator + current;
    let info = `<span class='label' style='min-width: 2em'>Σ ${count}</span>`;
    if (data.length) {
        const tags = [...new Set(data.flatMap((f) => f.tags || []))];
        const avg = count > 0 ? data.map((f) => +f.progress).reduce(sumUp) / count : 0;
        const bgColor = redToGreenGradient(avg);
        const color = bgColor.isDark() ? 'white' : 'black';
        const style = `min-width: 3em;background-color:${bgColor.hex()};color:${color}`;
        info += `<span class='label m10' style='${style}'>Ø ${avg.toFixed()}%</span>
            ${tags.map((t) => `<span class='label'>${t}</span>`).join('')}`;
    }
    return `<span class='title'>${value || 'n/a'}</span>${info}`;
};

export default {
    favColumn,
    status: statusFormatter,
    progress: progressFormatter,
    genre: genreFormatter,
    marked: markedFormatter,
    label: labelFormatter,
    timestamp: timestampFormatter,
    groupBy: groupByFormatter,
};
