import { writable } from 'svelte/store';
import type { MenuPages } from '../model/types';

export const currentMenu = writable<MenuPages>('login');
export const showTable = writable(false);

window.addEventListener('DOMContentLoaded', setTableVisibility);
window.addEventListener('popstate', setTableVisibility);
    
function setTableVisibility(): void {
    showTable.set(location.href.endsWith('samples') || /[#@]/.test(location.href));
}
