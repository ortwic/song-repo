import { writable } from 'svelte/store';
import type { TableView } from '../model/table-view.model';

export const tableView = writable<TableView>();
