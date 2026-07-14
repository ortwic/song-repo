import { writable } from 'svelte/store';
import type { MenuTarget } from '../model/app.types';

export const currentMenu = writable<MenuTarget>('hidden');
