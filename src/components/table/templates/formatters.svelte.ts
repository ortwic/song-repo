import Color from 'color';
import { marked } from 'marked';
import { t } from 'svelte-i18n';
import { mount } from 'svelte';
import { get } from 'svelte/store';
import type { CellComponent, GroupComponent } from 'tabulator-tables';
import type { ColumnDefinition } from '../tabulator/types';
import type { UserSnippet } from '../../../model/snippet.model';
import type { SongEntity } from '../../../domain/song.entity';
import type { AdvancedSettings } from '../../../model/settings.model';
import { StorageService } from '../../../service/base/storage.service';
import type SongService from '../../../service/user/user-song.service';
import { toDate } from '../../../utils/date.helper';
import ScorePreview from '../../ui/ScorePreview.svelte';
import ProgressBar from '../../ui/elements/ProgressBar.svelte';
import { genreColor, redToGreenGradient, redToGreenRange } from '../../../styles/style.helper';

function hiddenValue<T>(value: T): HTMLElement {
    const span = document.createElement('span');
    span.style.display = 'none';
    span.ariaLabel = String(value);
    span.textContent = String(value);
    return span;
}

export function createIntervals(value: number, range = 10) {
    if (value > 0) {
        const start = Math.floor((value - 1) / range) * range + 1;
        const end = start + range - 1;
        return `${start} - ${end}`;
    }
    return '0';
}

export function formatTemplates(songService: SongService, settings: AdvancedSettings) {
    const storage = new StorageService();

    return {
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
                    const song = cell.getData() as SongEntity;
                    const status = cell.getValue();
                    const element = cell.getElement();
                    element.title = status;
                    element.ariaLabel = status;
                    element.classList.add('status', status, song.statusMode !== 'auto' ? 'forced' : undefined);
                    return hiddenValue(status);
                },
            };
        },

        get progress(): Partial<ColumnDefinition> {
            return {
                formatter(cell: CellComponent, formatterParams: { min: number, max: number }): HTMLElement {
                    const song = cell.getData() as SongEntity;
                    const props = $state({
                        value: Number(cell.getValue()) ?? 0,
                        delta: song.retentionDelta(),
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
                            song.mastery = song.masteryFromProgress(value);
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
                groupByFunc: (song: SongEntity) => createIntervals(song.progress) + '%'
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
                },
                groupByFunc: (song: SongEntity) => createIntervals(song.difficulty, 2)
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

        get scorePreview(): Partial<ColumnDefinition> {
            return {
                formatter(cell: CellComponent): HTMLElement {
                    const height = '80px';
                    const target = document.createElement('div');
                    target.style.height = height;
                    storage.getFileUrl(cell.getValue())
                        .then(url => {
                            const props = $state({
                                url,
                                height,
                                firstInstrumentOnly: true,
                                measureCount: 2,
                                zoom: 0.8
                            });
                            mount(ScorePreview, { target, props });
                        });

                    return target;
                },
            }
        }
    } satisfies Record<string, Partial<ColumnDefinition>>;
}

export function snippetActionsFormatter(onAction: (id: string) => void): Partial<ColumnDefinition> {
    return {
        formatter(cell: CellComponent): HTMLElement {
            const id = cell.getData()['id'];
            const button = document.createElement('button');
            button.type = 'button';
            button.classList.add('clear');
            button.title = get(t)('menu.open');
            button.innerHTML = `<i class="bx bx-play-circle"></i>`;
            button.addEventListener('click', () => onAction(id));

            return button;
        }
    }
}

// ----------------------------------------------------------------------
// Group Header Formatters
// ----------------------------------------------------------------------

const formatterFuncs: Partial<Record<keyof SongEntity, (value: unknown) => string>> = {
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

const sumUp = (accumulator: number, current: number) => accumulator + current;

export const songGroupHeaderFormatter = (value: unknown, count: number, data: SongEntity[], group: GroupComponent) => {
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
    if (typeof value === 'object' && !Array.isArray(value)) {
        return field + info;
    }
    return formatterFuncs[field] ? formatterFuncs[field](value) + info
        : `<span class='title'>${value || 'n/a'}</span>${info}`;
};

export function createSnippetGroupHeader(onAction: (id: string) => void) {
    return {
        formatter(value: unknown, count: number, data: UserSnippet[], group: GroupComponent): HTMLElement {
            const firstId = data.at(0)['id'];
            const element = group.getElement();
            element.classList.add('no-wrap');

            const wrapper = document.createElement('span');
            wrapper.classList.add('snippet-group-header', 'no-wrap');

            const button = document.createElement('button');
            button.type = 'button';
            button.disabled = !data.length;
            button.classList.add('clear');
            button.innerHTML = `<i class="item bx bx-play-circle"></i> ${get(t)('menu.start')} (${count})`;
            button.addEventListener('click', () => onAction(firstId));
            wrapper.appendChild(button);

            const groups = Array.isArray(value) ? value.join(' > ') : value;
            const label = document.createElement('span');
            label.textContent = `${groups}`;
            wrapper.appendChild(label);

            const instruments = [...new Set(data.flatMap(s => s.instruments ?? []))];
            if (instruments.length) {
                const instrumentsEl = document.createElement('span');
                instrumentsEl.classList.add('instruments');
                instrumentsEl.textContent = instruments.join(', ');
                wrapper.appendChild(instrumentsEl);
            }

            return wrapper;
        }
    };
}