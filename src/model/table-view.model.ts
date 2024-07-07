import type { Tabulator } from 'tabulator-tables';

export interface TableView {
    table: Tabulator;
    groups: string[];
    toggleGroup(field: string): void;
    useResponsiveLayout: boolean;
}
