import { get } from 'svelte/store';
import { t } from 'svelte-i18n';
import type { CellComponent, MenuObject, MenuSeparator } from 'tabulator-tables';
import { SEARCH_ACTIONS, SongActions } from '../../../domain/song.actions';
import type { UserSong } from '../../../model/song.model';
import type { AdvancedSettings } from '../../../model/settings.model';
import { STATUS_KEYS } from '../../../model/types';
import { createSongEntity } from '../../../domain/song.entity';

export function buildActionMenu(actions: SongActions, settings: AdvancedSettings): Array<MenuObject<CellComponent> | MenuSeparator> {
    const songEntity = (c: CellComponent) => createSongEntity(c.getData() as UserSong, settings);
    const reformat = (c: CellComponent) => c.getRow().reformat();
    const translate = (key: string) => get(t)(key);

    return [
        {
            label: `<i class='bx bx-play'></i> <b>${translate('sessions.menu.start')}</b>`,
            action: (e, c) => actions.runSession(songEntity(c)),
        },
        {
            label: `<i class='bx bxs-bolt'></i> ${translate('sessions.menu.quick')}`,
            action: (e, c) => actions.quickSession(songEntity(c), settings.quickSessionDurationMinutes),
        },
        { separator: true },
        {
            label: `<i class='bx bx-edit'></i> ${translate('songs.menu.edit')}`,
            action: (e, c) => actions.editSong(songEntity(c)),
        },
        {
            label: `<i class='bx bx-search'></i> ${translate('songs.menu.search')}`,
            menu: SEARCH_ACTIONS.map((a) => ({
                label: `<i class='bx ${a.icon}'></i> ${translate(`songs.menu.search-${a.resource.replace(' ', '-')}`) ?? a.label}`,
                action: (e, c) => actions.search(songEntity(c), a),
            })),
        },
        { separator: true },
        {
            label: `<i class='bx bx-star'></i> ${translate('songs.menu.toggle-favorite')}`,
            action: async (e, c) => { await actions.toggleFavorite(songEntity(c)); reformat(c); },
        },
        {
            label: `<i class='bx bx-pie-chart'></i> ${translate('songs.menu.status-override')}`,
            menu: STATUS_KEYS.map((status) => ({
                label: `<i class='status ${status}'></i> ${translate(`songs.status.${status}`)}`,
                action: async (e, c) => { await actions.changeStatus(songEntity(c), status); reformat(c); },
            })),
        },
        {
            label: `<i class='bx bx-trash'></i> ${translate('songs.menu.delete')}`,
            menu: [
                {
                    label: `✓ ${translate('songs.menu.yes')} &nbsp; &nbsp;`,
                    action: (e, c) => actions.delete(songEntity(c)),
                },
                { label: `✗ ${translate('songs.menu.no')} &nbsp; &nbsp;` },
            ],
        },
    ];
}