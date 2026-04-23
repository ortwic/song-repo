import { writable } from 'svelte/store';
import type { TableView } from '../model/table-view.model';
import type { MenuTarget } from '../model/types';

export const tableView = writable<TableView>();
export const currentMenu = writable<MenuTarget>('hidden');
