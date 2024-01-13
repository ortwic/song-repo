import Color from 'color';
import { marked } from 'marked';
import { Timestamp } from 'firebase/firestore';
import type { ColumnDefinition, CellComponent } from 'tabulator-tables';
import './ProgressBar.class';
import type { UserSong } from '../../../model/song.model';
import { status } from '../../../model/types';
import { genreColor, redToGreenGradient, redToGreenRange } from '../../../styles/style.helper';

export default class Formatter {
    get default(): Partial<ColumnDefinition> { 
        return { }; 
    }

    get favorite(): Partial<ColumnDefinition> { 
        return {
            hozAlign: 'center',
            headerFilter: 'tickCross',
            headerFilterParams: {
                tristate: true
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
    }

    get status(): Partial<ColumnDefinition> { 
        return {
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
            headerFilterFuncParams: {
                values: Object.keys(status)
            }
        };
    }

    get progress(): Partial<ColumnDefinition> { 
        return {
            formatter(cell: CellComponent): HTMLElement | string {
                // const table = cell.getTable();
                const song = cell.getData() as UserSong;
                const bar = document.createElement('progress-bar');
                bar.setAttribute('value', cell.getValue());
                bar.addEventListener('change', (ev: CustomEvent<number[]>) => {
                    const [newValue, oldValue] = ev.detail;
                    cell.setValue(newValue);
        
                    if (newValue > 90) {
                        song.status = 'done';
                        // table.redraw(true); // required for update but causes scroll to top!
                    } else if (newValue < 10) {
                        song.status = 'archived';
                        // table.redraw(true); // required for update but causes scroll to top!
                    } else if (newValue < oldValue) {
                        song.status = 'repeat';
                        // table.redraw(true); // required for update but causes scroll to top!
                    } else if (oldValue < newValue) {
                        song.status = 'wip';
                        // table.redraw(true); // required for update but causes scroll to top!
                    }
                });
                return bar;
            },
        }; 
    }

    get genre(): Partial<ColumnDefinition> { 
        return {
            formatter(cell: CellComponent): string {
                const value = cell.getValue();
                try {
                    const bgColor = genreColor(value);
                    if (bgColor) {
                        const element = cell.getElement();
                        element.style.color = Color(bgColor).isDark() ? 'white' : 'black';
                        element.style.backgroundColor = bgColor;
                    }
                } catch { /* empty */ }
                return value;
            },
        }; 
    }

    get image(): Partial<ColumnDefinition> { 
        return {
            formatter(cell: CellComponent) {
                const url = cell.getValue();
                const element = cell.getElement();
                element.style.backgroundImage = `url(${url ?? './logo-512.png'})`;
                element.style.backgroundRepeat = 'no-repeat';
                element.style.backgroundPosition = 'center';
                element.style.backgroundSize = url ? 'cover' : '80%';
                return '&nbsp;';
            }
        }; 
    }
    
    get url(): Partial<ColumnDefinition> { 
        return {
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
            }
        };
    }

    get length(): Partial<ColumnDefinition> { 
        return {
            formatter: (cell: CellComponent): string => cell.getValue()?.length,
            formatterParams: { hideTitle: true }
        }; 
    }

    get difficulty(): Partial<ColumnDefinition> { 
        return {
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
                    element.style.border = '1px solid silver';
                }
                return value;
            },
            editorParams: { 
                min: 1, 
                max: 10 
            }
        }; 
    }

    get marked(): Partial<ColumnDefinition> { 
        return {
            formatter(cell: CellComponent): string {
                const value = cell.getValue();
                return value ? marked(value, { mangle: false, headerIds: false }) : value;
            },
        };
    }
    
    get label(): Partial<ColumnDefinition> { 
        return {
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
    }

    get timestamp(): Partial<ColumnDefinition> { 
        return {
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
    }

    static get(key: keyof Formatter) {
        return new Formatter()[key];
    }
}

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
