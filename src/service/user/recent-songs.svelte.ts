import type { UserSongFilter } from '../../model/song.model';
import type { Status } from '../../model/types';

export const MAX_LIMIT = 20;

export const recentFilter = $state<UserSongFilter>({
    limit: 4,
    status: {
        todo: true,
        repeat: true,
        wip: true,
        done: false,
        archived: false
    },
    fav: undefined
});

// function setFilter(value: Partial<UserSongFilter>) {
//     recentFilter = { ...recentFilter, ...value };
// }

// function setFavorite({ target }: Event) {
//     const fav = (target as HTMLInputElement).checked;
//     setFilter({ fav });
// }

// function setLimit({ target }: Event) {
//     const limit = (target as HTMLInputElement).valueAsNumber;
//     setFilter({ limit });
// }

export function toggleStatus(status: Status) {
    // setFilter({
    //     status: {
    //         ...recentFilter.status,
    //         [status]: !recentFilter.status[status]
    //     }
    // });
    recentFilter.status[status] = !recentFilter.status[status];
}