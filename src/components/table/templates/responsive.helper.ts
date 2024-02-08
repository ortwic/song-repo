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

export const summaryFormatter = (readonly = false): Partial<ColumnDefinition> => ({
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
