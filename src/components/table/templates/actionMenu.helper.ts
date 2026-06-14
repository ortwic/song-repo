import type { CellComponent, MenuObject, MenuSeparator } from 'tabulator-tables';
import type { UserSong } from '../../../model/song.model';
import type { MessageFormatter } from '../../../service/base/i18n.setup';
import { SEARCH_ACTIONS, SongActions } from '../SongActions.class';

export function buildActionMenu(actions: SongActions, t: MessageFormatter): Array<MenuObject<CellComponent> | MenuSeparator> {
    const cell = (c: CellComponent) => c.getData() as UserSong;
    const reformat = (c: CellComponent) => c.getRow().reformat();

    return [
        {
            label: `<i class='bx bx-link-external'></i> <b>${t('songs.menu.open')}</b>`,
            action(e, c) {
                const song = cell(c);
                song.uri ? void (actions.showResource(song)) : actions.editSong(song);
            }
        },
        {
            label: `<i class='bx bx-edit'></i> ${t('songs.menu.edit')}`,
            action: (e, c) => actions.editSong(cell(c)),
        },
        {
            label: `<i class='bx bx-search'></i> ${t('songs.menu.search')}`,
            menu: SEARCH_ACTIONS.map((a) => ({
                label: `<i class='bx ${a.icon}'></i> ${t(`songs.menu.search-${a.resource.replace(' ', '-')}`) ?? a.label}`,
                action: (e, c) => actions.search(cell(c), a),
            })),
        },
        { separator: true },
        {
            label: `<i class='bx bx-star'></i> ${t('songs.menu.toggle-favorite')}`,
            action: async (e, c) => { await actions.toggleFavorite(cell(c)); reformat(c); },
        },
        {
            label: `<i class='bx bx-pie-chart'></i> ${t('songs.menu.change-status')}`,
            menu: ['todo', 'wip', 'done', 'repeat', 'archived'].map((status) => ({
                label: `<i class='status ${status}'></i> ${t(`songs.status.${status}`)}`,
                action: async (e, c) => { await actions.changeStatus(cell(c), status); reformat(c); },
            })),
        },
        {
            label: `<i class='bx bx-trash'></i> ${t('songs.menu.delete')}`,
            menu: [
                {
                    label: `✓ ${t('songs.menu.yes')} &nbsp; &nbsp;`,
                    action: (e, c) => actions.delete(cell(c)),
                },
                { label: `✗ ${t('songs.menu.no')} &nbsp; &nbsp;` },
            ],
        },
    ];
}