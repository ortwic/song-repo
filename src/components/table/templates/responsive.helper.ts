import type { ColumnDefinition } from 'tabulator-tables';
import type { UserSong } from '../../../model/song.model';
import { genreColor, redToGreenRange } from '../../../styles/style.helper';

function createButton(icon: string, onAction: (event: MouseEvent) => void) {
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('clear');
    button.innerHTML = `<i class="bx ${icon}"></i>`;
    button.addEventListener('click', onAction);
    return button;
}

function formatProgress(progress: number) {
    const pgColor = redToGreenRange(progress);
    const pgStyle = `background-color:${pgColor.hex()};color:${pgColor.isDark() ? 'white' : 'black'}`;
    return `<span class='label' style='${pgStyle}'>${progress}%</span>`;
}

function formatStatus<T>(status: T) {
    return `<span class='status ${status}'></span>`;
}

export function songSummaryFormatter(readonly: boolean, onRequest: (song: UserSong) => void): Partial<ColumnDefinition> {
    return {
        formatter(cell) {
            const element = cell.getElement();
            element.classList.add('responsive');

            const data = cell.getData();
            const color = genreColor(data['genre']);
            if (color) {
                element.title = `${data['genre']} ${data['style']}`;
                element.style.background = `radial-gradient(farthest-corner at 0% 0%, transparent 66%, ${color})`;
            }

            const wrapper = document.createElement('span');
            wrapper.classList.add('song-summary');

            if (readonly && onRequest) {
                wrapper.appendChild(createButton('jukebox', () => onRequest(data as UserSong)));
            } else {
                wrapper.insertAdjacentHTML('beforeend', formatProgress(data['progress']));
                wrapper.insertAdjacentHTML('beforeend', formatStatus(data['status']));
            }

            const favActive = data['fav'] ? 'active' : '';
            const artist = document.createElement('span');
            artist.classList.add('artist', 'fav');
            if (favActive) {
                artist.classList.add(favActive);
            }
            artist.textContent = data['artist'] ?? '';
            wrapper.appendChild(artist);

            const title = document.createElement('span');
            title.classList.add('title');
            if (favActive) {
                title.classList.add(favActive);
            }
            title.textContent = data['title'] ?? '';
            wrapper.appendChild(title);

            const resource = data['uri'] ? 'link-external' : 'unlink';
            const sup = document.createElement('sup');
            sup.innerHTML = `<i class="bx bx-${resource}"></i>`;
            wrapper.appendChild(sup);

            return wrapper;
        }
    };
}

export function snippetSummaryFormatter(onAction: (id: string) => void): Partial<ColumnDefinition> {
    return {
        formatter(cell) {
            const element = cell.getElement();
            element.classList.add('responsive');
            const data = cell.getData();

            const color = genreColor(data['type']);
            if (color) {
                element.title = `${data['type']}`;
                element.style.background = `radial-gradient(farthest-corner at 0% 0%, transparent 66%, ${color})`;
            }

            const wrapper = document.createElement('span');
            wrapper.classList.add('snippet-summary');

            const actionButton = createButton('bx-play-circle', () => onAction(data['id']));
            wrapper.appendChild(actionButton);

            const favActive = data['fav'] ? 'active' : '';
            const artist = document.createElement('span');
            artist.classList.add('artist', 'fav');
            if (favActive) {
                artist.classList.add(favActive);
            }
            artist.textContent = data['artist'] ?? '';
            wrapper.appendChild(artist);

            const title = document.createElement('span');
            title.classList.add('title');
            if (favActive) {
                title.classList.add(favActive);
            }
            title.textContent = data['title'] ?? '';
            wrapper.appendChild(title);

            const instruments = Array.isArray(data['instruments']) ? data['instruments'] : [];
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