import type { ColumnDefinition, Options } from 'tabulator-tables';

type CollapsedCellData = { field: string, title: string, value: string };
  
const cellFormatter = (data: CollapsedCellData[]) => {
    //data - an array of objects containing the column title and value for each cell
    if (Object.keys(data).length) {
    
        const list = document.createElement('div');
        list.classList.add('flex');

        data.forEach(({ title, value }) => {
            const item = document.createElement('div');
            item.innerHTML = `<label>${title}</label><p>${value !== undefined ? value : ''}</p>`;
            list.appendChild(item);
        });
        return list;
    }
    return '';
};

export const withResponsiveLayout = (options: Options): Options => {
    const toggleCollapseColumn: ColumnDefinition = { 
        title: '',
        formatter: 'responsiveCollapse',
        minWidth: 30,
        resizable: false,
        headerSort: false
    };

    if (window.innerWidth < window.innerHeight) {
        options.columns.unshift(toggleCollapseColumn);
        options.responsiveLayout = 'collapse';
        options.responsiveLayoutCollapseStartOpen = false;
        options.responsiveLayoutCollapseFormatter = cellFormatter;
    }
    return options;
};
