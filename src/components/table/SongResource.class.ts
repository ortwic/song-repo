import type { Readable } from 'svelte/store';
import type { CellComponent, MenuObject, MenuSeparator } from 'tabulator-tables';
import type { UserSong } from '../../model/song.model';
import type { Status } from '../../model/types';
import { showError } from '../../store/notification.store';
import type SongService from '../../service/song.service';

export interface Dialog<T> {
    showDialog(param: T): Readable<string>;
}

export default class SongResource {
    constructor(private service: SongService) {
    }

    getMenu(getDialog: () => Dialog<string>): Array<MenuObject<CellComponent> | MenuSeparator> {
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
                label: '<i class=\'bx bx-link-external\'></i> <b>Open resource</b>',
                action(e, cell: CellComponent) {
                    const song = cell.getData() as UserSong;
                    if (song.uri) {
                        try {
                            new URL(song.uri);
                            window.open(song.uri, '_blank');
                        } catch {                         
                            showError(`Not a valid URI: ${song.uri}`);
                        }
                    } else {
                        promptResource(song);
                    }
                }
            },
            {
                label: '<i class=\'bx bx-search\'></i> Search resources',
                menu: [
                    {
                        label: '<i class=\'bx bx-music\'></i> Search sheet music (musescore)',
                        action(e, cell: CellComponent) {
                            const song = cell.getData() as UserSong;
                            window.open(`https://musescore.com/sheetmusic?text=${song.artist}+${song.title}`, '_blank');
                        }
                    },
                    {
                        label: '<i class=\'bx bxs-file-pdf\'></i> Search sheet music (PDF)',
                        action(e, cell: CellComponent) {
                            const song = cell.getData() as UserSong;
                            window.open(`https://google.com/search?q="${song.artist}"+"${song.title}"+sheet+music+filetype:pdf`, '_blank');
                        }
                    },
                    {
                        label: '<i class=\'bx bx-play-circle\'></i> Search tutorial (Synthesia)',
                        action(e, cell: CellComponent) {
                            const song = cell.getData() as UserSong;
                            window.open(`https://google.com/search?q="${song.artist}"+"${song.title}"+synthesia+tutorial`, '_blank');
                        }
                    },
                    {
                        label: '<i class=\'bx bx-text\'></i> Search lyrics',
                        action(e, cell: CellComponent) {
                            const song = cell.getData() as UserSong;
                            window.open(`https://google.com/search?q="${song.artist}"+"${song.title}"+lyrics`, '_blank');
                        }
                    },
                    {
                        label: '<i class=\'bx bxs-piano\'></i> Search midi file',
                        action(e, cell: CellComponent) {
                            const song = cell.getData() as UserSong;
                            window.open(`https://google.com/search?q="${song.artist}"+"${song.title}"+filetype:midi`, '_blank');
                        }
                    },
                ]
            },
            {
                label: '<i class=\'bx bx-link\'></i> Change resource',
                action: (e, cell) => promptResource(cell.getData() as UserSong)
            },
            {
                separator: true
            },
            {
                label: '<i class=\'bx bx-pie-chart\'></i> Change status',
                menu: [
                    {
                        label: '<i class=\'status todo\'></i> Todo',
                        action: (e, cell: CellComponent) => changeStatusHandler(cell, 'todo')
                    },
                    {
                        label: '<i class=\'status wip\'></i> Wip',
                        action: (e, cell: CellComponent) => changeStatusHandler(cell, 'wip')
                    },
                    {
                        label: '<i class=\'status done\'></i> Done',
                        action: (e, cell: CellComponent) => changeStatusHandler(cell, 'done')
                    },
                    {
                        label: '<i class=\'status repeat\'></i> Repeat',
                        action: (e, cell: CellComponent) => changeStatusHandler(cell, 'repeat')
                    },
                    {
                        label: '<i class=\'status archived\'></i> Archived',
                        action: (e, cell: CellComponent) => changeStatusHandler(cell, 'archived')
                    }
                ]
            },
            {
                label: '<i class=\'bx bx-trash\'></i> Delete?',
                menu: [
                    {
                        label: '✓ Yes &nbsp; &nbsp;',
                        action: (e, cell: CellComponent) => deleteRow(cell.getData() as UserSong)
                    },
                    {
                        label: '✗ No &nbsp; &nbsp;'
                    },
                ]
            },
        ];
    }
}

