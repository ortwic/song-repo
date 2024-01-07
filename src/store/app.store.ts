import { writable } from 'svelte/store';
import type { MenuPages } from '../model/types';
import type { TableView } from '../model/table-view.model';

export const currentMenu = writable<MenuPages>('login');
export const tableView = writable<TableView>();

window.addEventListener('DOMContentLoaded', setMenuVisibility);
window.addEventListener('popstate', setMenuVisibility);
    
function setMenuVisibility(): void {
    const tableview = location.href.endsWith('samples') || /[#@]/.test(location.href);
    currentMenu.set(tableview ? 'root' : 'login');
}
