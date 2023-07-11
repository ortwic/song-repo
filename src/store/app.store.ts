import { writable } from 'svelte/store';
import type { MenuPages } from '../model/types';

export const currentMenu = writable<MenuPages>('login');
