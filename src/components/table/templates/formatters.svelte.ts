import Color from 'color';
import { marked } from 'marked';
import { mount } from 'svelte';
import type { CellComponent, GroupComponent } from 'tabulator-tables';
import type { ColumnDefinition } from '../tabulator/types';
import { createSongEntity } from '../../../domain/song.entity';
import type { AdvancedSettings } from '../../../model/settings.model';
import type { UserSong } from '../../../model/song.model';
import { STATUS_KEYS } from '../../../model/types';
import type SongService from '../../../service/user/user-song.service';
import { toDate } from '../../../utils/date.helper';
import ProgressBar from '../../ui/elements/ProgressBar.svelte';
import { genreColor, redToGreenGradient, redToGreenRange } from '../../../styles/style.helper';

function hiddenValue<T>(value: T): HTMLElement {
    const span = document.createElement('span');
    span.style.display = 'none';
    span.ariaLabel = String(value);
    span.textContent = String(value);
    return span;
}

export function formatFactory(songService: SongService, settings: AdvancedSettings) {
    const formatterTemplates = {
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
        },

        get status(): Partial<ColumnDefinition> {
            return {
                formatter(cell: CellComponent): HTMLElement | string {
                    const song = cell.getData() as UserSong;
                    const entity = createSongEntity(song, settings);
                    const status = entity.resolvedStatus();
                    const element = cell.getElement();
                    element.title = status;
                    element.classList.add('status', status, entity.status ? 'forced' : undefined);
                    return hiddenValue(status);
                },
                accessorDownload(value: string, data: UserSong): string {
                    const entity = createSongEntity(data, settings);
                    return entity.resolvedStatus();
                },
                headerFilterFuncParams: {
                    values: STATUS_KEYS
                },
            };
        },

        get progress(): Partial<ColumnDefinition> {
            const progress = (data: UserSong) => {
                if (data.progress > 0) {
                    const value = Math.floor((data.progress - 1) / 10) * 10 + 1;
                    return`${value} - ${value + 9}%`;
                }
                return '0%';
            };

            return {
                formatter(cell: CellComponent, formatterParams: { min: number, max: number }): HTMLElement {
                    const song = cell.getData() as UserSong;
                    const entity = createSongEntity(song, settings);
                    const props = $state({
                        value: Number(cell.getValue()) ?? 0,
                        delta: entity.retentionDelta(),
                        min: formatterParams.min,
                        max: formatterParams.max,
                        disabled: false,
                        onChange: undefined as ((n: number, o: number) => void) | undefined,
                    });

                    const target = document.createElement('div');
                    mount(ProgressBar, { target, props });

                    if (settings.editProgressManually) {
                        props.onChange = (value: number) => {
                            cell.setValue(value);
                            song.progress = value;
                            song.mastery = entity.masteryFromProgress();
                            songService.updateSong(song).then(() => cell.getRow().reformat());
                        };
                    } else {
                        props.disabled = true;
                    }

                    return target;
                },
                formatterParams: {
                    min: 0,
                    max: 100
                },
                groupByFunc: progress
            };
        },

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
                            element.style.borderRadius = '.4em';
                        }
                    } catch { /* empty */ }
                    return value;
                },
            };
        },

        get image(): Partial<ColumnDefinition> {
            return {
                formatter(cell: CellComponent) {
                    const url = cell.getValue();
                    const element = cell.getElement();
                    element.classList.add('image');
                    if (url) {
                        element.style.backgroundImage = `url(${url})`;
                    } else {
                        element.classList.add('default');
                    }
                    return '&nbsp;';
                }
            };
        },

        get resource(): Partial<ColumnDefinition> {
            return {
                formatter(cell: CellComponent) {
                    const resource = cell.getValue();
                    if (resource) {
                        const anchor = document.createElement('a') as HTMLAnchorElement;
                        anchor.href = resource;
                        anchor.target = '_blank';
                        anchor.innerHTML = '<i class="bx bx-link"></i>';
                        anchor.appendChild(hiddenValue(resource));
                        try {
                            const url = new URL(resource);
                            anchor.title = `${url.hostname}${url.pathname}${url.search ?? url.hash}`;
                        } catch (error) {
                            anchor.title = resource;
                        }
                        return anchor;
                    }
                }
            };
        },

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
                        const [gradient] = redToGreenGradient((10 - value) * 10, 'to left', .2);
                        element.style.color = 'black';
                        element.style.background = gradient;
                        element.style.border = '1px solid silver';
                        element.style.borderRadius = '.4em';
                    }
                    return value;
                },
                editorParams: {
                    min: 1,
                    max: 10
                }
            };
        },

        get marked(): Partial<ColumnDefinition> {
            return {
                formatter(cell: CellComponent): string {
                    const value = cell.getValue();
                    return value ? marked(value, { mangle: false, headerIds: false }) : value;
                },
            };
        },

        get label(): Partial<ColumnDefinition> {
            return {
                formatter(cell: CellComponent): string {
                    const asLabel = (value: string) => `<span class='label'>${value}</span>`;
                    const value = cell.getValue();
                    if (Array.isArray(value)) {
                        return value.map(asLabel).join('');
                    }
                    if (value && typeof value === 'object') {
                        return Object.entries(value).map(([key, value]) => asLabel(`${key}: ${value}`)).join('');
                    }
                    if (value?.length) {
                        return value.toString().split(',').map(asLabel).join('');
                    }
                },
            };
        },

        get timestamp(): Partial<ColumnDefinition> {
            return {
                formatter(cell: CellComponent): string {
                    const value = cell.getValue();
                    return value ? toDate(value).toISODate() : '';
                },
            };
        },
    } satisfies Record<string, Partial<ColumnDefinition>>;

    return (key: keyof typeof formatterTemplates) => formatterTemplates[key];
}


const formatterFuncs: Partial<Record<keyof UserSong, (value: unknown) => string>> = {
    fav(value) {
        return `<span class='fav ${value ? 'active': ''}'></span>`;
    },
    status(value) {
        return `<span class='status ${value}' title='${value}'></span>`;
    },
    artistImg(value) {
        return !value ? '<span class=\'image group default\'>&nbsp;</span>'
            : `<span class='image group' style='background-image: url(${value})'>&nbsp;</span>`;
    }
};

export const groupByFormatter = (value: unknown, count: number, data: UserSong[], group: GroupComponent) => {
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
    const field = group.getField();
    return formatterFuncs[field] ? formatterFuncs[field](value) + info
        : `<span class='title'>${value || 'n/a'}</span>${info}`;
};