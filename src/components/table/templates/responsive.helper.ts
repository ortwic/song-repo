import type { Options } from 'tabulator-tables';

export const useResponsiveLayout = (options: Options, enable = true): Options => {
    const responsiveColumn = options.columns.find(c => c.formatter === 'responsiveCollapse');
    if (enable) {
        if (!responsiveColumn) {
            options.columns.unshift({
                title: '',
                formatter: 'responsiveCollapse',
                minWidth: 30,
                resizable: false,
                headerSort: false, 
                responsive: 0
            });
        }
    
        return {
            ...options,
            responsiveLayout: 'collapse',
            responsiveLayoutCollapseStartOpen: false,
        };
    }
    if (responsiveColumn) {
        options.columns.shift();
    }
    return options;
};
