import { writable } from 'svelte/store';

const watch = <T>(mediaquery: string, map: (matches: boolean) => T) => (writable<T>(undefined, set => {
    const queryList = window.matchMedia(mediaquery);
    queryList.addEventListener('change', ({ matches }) => set(map(matches)));
    set(map(queryList.matches));
}));

export type Orientation = 'landscape' | 'portrait';
export const orientation = watch<Orientation>('(orientation: landscape)', m => m ? 'landscape' : 'portrait');

export type ColorScheme = 'dark' | 'light';
export const colorScheme = watch<ColorScheme>('(prefers-color-scheme: dark)', m => m ? 'dark' : 'light');
