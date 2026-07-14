import type { ColumnDefinition } from 'tabulator-tables';
import { genreColor, redToGreenRange } from '../../../styles/style.helper';

function formatProgress(progress: number) {
    const pgColor = redToGreenRange(progress);
    const pgStyle = `background-color:${pgColor.hex()};color:${pgColor.isDark() ? 'white' : 'black'}`;
    return `<span class='label' style='${pgStyle}'>${progress}%</span>`;
}

function formatStatus<T>(status: T) {
    return `<span class='status ${status}'></span>`;
}

export const songSummaryFormatter = (readonly = false): Partial<ColumnDefinition> => ({
    formatter(cell) {
        const element = cell.getElement();
        element.classList.add('responsive');

        const data = cell.getData();
        const color = genreColor(data['genre']);
        if (color) {
            element.title = `${data['genre']} ${data['style']}`;
            element.style.background = `radial-gradient(farthest-corner at 0% 0%, transparent 66%, ${color})`;
            // + `, right / auto 100% no-repeat url("${data['artistImg']}")`;
        }
        
        const resource = data['uri'] ? 'link-external' : 'unlink';
        const favActive = data['fav'] ? 'active' : '';
        return `
            ${readonly ? '' : formatProgress(data['progress'])}
            ${readonly ? '' : formatStatus(data['status'])}
            <span class='artist fav ${favActive}'>
                ${data['artist']}</span><span class='title ${favActive}'>
                ${data['title']}
            </span>
            <sup><i class="bx bx-${resource}"></i></sup>`;
    }
});

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

            const button = document.createElement('button');
            button.type = 'button';
            button.classList.add('clear', 'play-action');
            button.innerHTML = `<i class="bx bx-play-circle"></i>`;
            button.addEventListener('click', () => onAction(data['id']));
            wrapper.appendChild(button);

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