import type { ColumnDefinition } from 'tabulator-tables';
import type { CollapsedCellData } from '../tabulator/modules/ResponsiveLayout';
import { genreColor, redToGreenRange } from '../../../styles/style.helper';

export const summaryFormatter: Partial<ColumnDefinition> = {
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
        
        const status = data['status'];
        const progress = data['progress'];
        const resource = data['uri'] ? 'link-external' : 'unlink';
        const favActive = data['fav'] ? 'active' : '';
        const pgColor = redToGreenRange(progress);
        const pgStyle = `background-color:${pgColor.hex()};color:${pgColor.isDark() ? 'white' : 'black'}`;
        return `
            <span class='label' style='${pgStyle}'>${progress}%</span>
            <span class='status ${status}'></span>
            <span class='title fav ${favActive}'>${data['artist']} - ${data['title']}</span>
            <sup><i class="bx bx-${resource}"></i></sup>`;
    }
};

export const detailLayoutFormatter = (data: CollapsedCellData[]) => {
    const list = document.createElement('div');
    list.classList.add('flex');
    
    const createCell = ({ title, value }) => {
        const div = document.createElement('div');
        if (title) {
            const label = document.createElement('label');
            label.innerHTML = title;
            div.appendChild(label);
        }

        if(value instanceof Node){
            div.appendChild(value);
        }else if(value !== undefined){
            const p = document.createElement('p');
            p.innerHTML = value;
            div.appendChild(p);
        }

        list.appendChild(div);
    };
        
    data.forEach(createCell);

    return Object.keys(data).length ? list : undefined;
};