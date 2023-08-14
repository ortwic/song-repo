import { writable } from 'svelte/store';
import type { MenuPages } from '../model/types';

export const currentMenu = writable<MenuPages>('login');
export const showTable = writable(false);

window.addEventListener('DOMContentLoaded', setTableVisibility);
window.addEventListener('popstate', setTableVisibility);
    
function setTableVisibility(): void {
    const tableview = location.href.endsWith('samples') || /[#@]/.test(location.href);
    showTable.set(tableview);
    currentMenu.set(tableview ? 'root' : 'login');
}
