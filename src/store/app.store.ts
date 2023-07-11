import { writable } from 'svelte/store';

type MenuPages = 'none' | 'login' | 'signup';

export const currentMenu = writable<MenuPages>('login');
