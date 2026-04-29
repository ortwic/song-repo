import type { Readable } from 'svelte/store';

export interface Dialog<T> {
    showDialog(param: T): Readable<string>;
}
