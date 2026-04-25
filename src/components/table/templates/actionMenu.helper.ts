import type { CellComponent, MenuObject, MenuSeparator } from 'tabulator-tables';
import type { Dialog } from '../../../model/dialog.model';
import type { UserSong } from '../../../model/song.model';
import type { MessageFormatter } from '../../../service/i18n.setup';
import { SEARCH_ACTIONS, SongActions } from '../SongActions.class';
import { showError } from '../../../store/notification.store';

export function buildActionMenu(actions: SongActions, t: MessageFormatter, getDialog: () => Dialog<string>): Array<MenuObject<CellComponent> | MenuSeparator> {
    const promptResource = async (song: UserSong) => {
        const unsubscribe = getDialog().showDialog(song.uri).subscribe(async (result) => {
            try {
                await actions.setUri(song, result);
            } catch (error) {
                showError(error.message);
            } finally {
                unsubscribe();
            }
        });
    };

    const cell = (c: CellComponent) => c.getData() as UserSong;
    const reformat = (c: CellComponent) => c.getRow().reformat();

    return [
        {
            label: `<i class='bx bx-link-external'></i> <b>${t('songs.menu.open')}</b>`,
            action(e, c) {
                const song = cell(c);
                song.uri ? void (actions.openUri(song)) : promptResource(song);
            }
        },
        {
            label: `<i class='bx bx-search'></i> ${t('songs.menu.search')}`,
            menu: SEARCH_ACTIONS.map((a) => ({
                label: `<i class='bx ${a.icon}'></i> ${t(`songs.menu.search-${a.resource.replace(' ', '-')}`) ?? a.label}`,
                action: (e, c) => actions.search(cell(c), a),
            })),
        },
        {
            label: `<i class='bx bx-link'></i> ${t('songs.menu.change-resource')}`,
            action: (e, c) => promptResource(cell(c)),
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