import { writable } from 'svelte/store';
import type { MenuPages } from '../model/types';

export const lang = navigator.language.startsWith('de') ? 'de-DE' : 'en-US';
export const currentMenu = writable<MenuPages>('login');

window.addEventListener('DOMContentLoaded', setMenuVisibility);
window.addEventListener('popstate', setMenuVisibility);
    
function setMenuVisibility(): void {
    const tableview = location.href.endsWith('samples') || /[#@]/.test(location.href);
    currentMenu.set(tableview ? 'root' : 'login');
}
