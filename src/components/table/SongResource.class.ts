import type { Readable } from 'svelte/store';
import type { CellComponent, MenuObject, MenuSeparator } from 'tabulator-tables';
import type { UserSong } from '../../model/song.model';
import type { Status } from '../../model/types';
import type { MessageFormatter } from '../../service/i18n';
import type SongService from '../../service/song.service';
import { showError } from '../../store/notification.store';
import { logAction } from '../../store/notification.store';

export interface Dialog<T> {
    showDialog(param: T): Readable<string>;
}

export default class SongResource {
    constructor(private service: SongService) {
    }

    getMenu(t: MessageFormatter, getDialog: () => Dialog<string>): Array<MenuObject<CellComponent> | MenuSeparator> {
        const toggleFavoriteHandler = async (cell: CellComponent) => {
            const song = cell.getData() as UserSong;
            song.fav = !song.fav;
            await this.service.setSong(song);
            
            // cell.getTable().redraw(true); // required for update but causes scroll to top!
        };

        const changeStatusHandler = (cell: CellComponent, status: Status) => {
            const element = cell.getElement();
            element.classList.replace(cell.getValue(), status);
            cell.setValue(status);
        };

        const promptResource = async (song: UserSong) => {
            const unsubscribe = getDialog().showDialog(song.uri).subscribe(async result => {
                if (song &&  song?.uri !== result) {
                    try {
                        song.uri = result;
                        await this.service.setSong(song);
                    } catch (error) {
                        showError(error.message);
                    } finally {
                        unsubscribe();
                    }
                }
            });
        };

        const deleteRow = async (song: UserSong): Promise<void> => {
            try {
                await this.service.deleteSong(song);
            } catch (error) {
                showError(error.message);
            }
        };

        return [
            {
                label: `<i class='bx bx-link-external'></i> <b>${t('songs.menu.open')}</b>`,
                action(e, cell: CellComponent) {
                    const song = cell.getData() as UserSong;
                    if (song.uri) {
                        try {
                            new URL(song.uri);
                            window.open(song.uri, '_blank');
                        } catch {                         
                            showError(`${t('songs.resource.invalid-uri')} ${song.uri}`);
                        }
                    } else {
                        promptResource(song);
                    }
                }
            },
            {
                label: `<i class='bx bx-search'></i> ${t('songs.menu.search')}`,
                menu: [
                    {
                        label: `<i class='bx bx-music'></i> ${t('songs.menu.search-sheet-music')} (musescore)`,
                        action(e, cell: CellComponent) {
                            const song = cell.getData() as UserSong;
                            logAction({ type: 'search', resource: 'musecore', song });
                            window.open(`https://musescore.com/sheetmusic?text=${song.artist}+${song.title}`, '_blank');
                        }
                    },
                    {
                        label: `<i class='bx bxs-file-pdf'></i> ${t('songs.menu.search-sheet-music')} (PDF)`,
                        action(e, cell: CellComponent) {
                            const song = cell.getData() as UserSong;
                            logAction({ type: 'search', resource: 'sheet music', song });
                            window.open(`https://google.com/search?q="${song.artist}"+"${song.title}"+sheet+music+filetype:pdf`, '_blank');
                        }
                    },
                    {
                        label: `<i class='bx bx-play-circle'></i> ${t('songs.menu.search-tutorial')} (Synthesia)`,
                        action(e, cell: CellComponent) {
                            const song = cell.getData() as UserSong;
                            logAction({ type: 'search', resource: 'tutorial', song });
                            window.open(`https://google.com/search?q="${song.artist}"+"${song.title}"+synthesia+tutorial`, '_blank');
                        }
                    },
                    {
                        label: `<i class='bx bx-text'></i> ${t('songs.menu.search-lyrics')}`,
                        action(e, cell: CellComponent) {
                            const song = cell.getData() as UserSong;
                            logAction({ type: 'search', resource: 'lyrics', song });
                            window.open(`https://google.com/search?q="${song.artist}"+"${song.title}"+lyrics`, '_blank');
                        }
                    },
                    {
                        label: `<i class='bx bxs-piano'></i> ${t('songs.menu.search-midi-file')}`,
                        action(e, cell: CellComponent) {
                            const song = cell.getData() as UserSong;
                            logAction({ type: 'search', resource: 'midi file', song });
                            window.open(`https://google.com/search?q="${song.artist}"+"${song.title}"+filetype:midi`, '_blank');
                        }
                    },
                ]
            },
            {
                label: `<i class='bx bx-link'></i> ${t('songs.menu.change-resource')}`,
                action: (e, cell) => promptResource(cell.getData() as UserSong)
            },
            {
                separator: true
            },
            {
                label: `<i class='bx bx-star'></i> ${t('songs.menu.toggle-favorite')}`,
                action: (e, cell) => toggleFavoriteHandler(cell)
            },
            {
                label: `<i class='bx bx-pie-chart'></i> ${t('songs.menu.change-status')}`,
                menu: [
                    {
                        label: `<i class='status todo'></i> ${t('songs.status.todo')}`,
                        action: (e, cell: CellComponent) => changeStatusHandler(cell, 'todo')
                    },
                    {
                        label: `<i class='status wip'></i> ${t('songs.status.wip')}`,
                        action: (e, cell: CellComponent) => changeStatusHandler(cell, 'wip')
                    },
                    {
                        label: `<i class='status done'></i> ${t('songs.status.done')}`,
                        action: (e, cell: CellComponent) => changeStatusHandler(cell, 'done')
                    },
                    {
                        label: `<i class='status repeat'></i> ${t('songs.status.repeat')}`,
                        action: (e, cell: CellComponent) => changeStatusHandler(cell, 'repeat')
                    },
                    {
                        label: `<i class='status archived'></i> ${t('songs.status.archived')}`,
                        action: (e, cell: CellComponent) => changeStatusHandler(cell, 'archived')
                    }
                ]
            },
            {
                label: `<i class='bx bx-trash'></i> ${t('songs.menu.delete')}`,
                menu: [
                    {
                        label: `✓ ${t('songs.menu.yes')} &nbsp; &nbsp;`,
                        action: (e, cell: CellComponent) => deleteRow(cell.getData() as UserSong)
                    },
                    {
                        label: `✗ ${t('songs.menu.no')} &nbsp; &nbsp;`
                    },
                ]
            },
        ];
    }
}

