import { writable } from 'svelte/store';
import type { Tabulator } from 'tabulator-tables';
import type { MenuTarget } from '../model/app.types';

export interface TableView {
    id: string;
    table: Tabulator;
    groups: string[];
    toggleGroup(field: string): void;
    useResponsiveLayout: boolean;
}

export const tableView = writable<TableView>();
export const currentMenu = writable<MenuTarget>('hidden');
