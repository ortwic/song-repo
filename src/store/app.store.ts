import { writable } from 'svelte/store';
import type { MenuTarget } from '../model/app.types';

export const setAppReady = () => document.body.classList.add('app-ready');

export const currentMenu = writable<MenuTarget>('hidden');
