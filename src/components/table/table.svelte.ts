import type { Action } from 'svelte/action';
import { createTable, type TableParams, type TableView } from './table.action';

let currentView: TableView | undefined = $state();

const adapter = <T>(element: HTMLElement, params: TableParams<T>) => createTable(element, { 
    ...params, 
    onInit(view) {
        params.onInit?.(view);
        currentView = view;
    },
    onDestroy() {
        params.onDestroy?.();
        currentView = undefined;
    }
});

type TableContext<T> = Partial<TableView> & Action<HTMLElement, TableParams<T>>;
export const tableContext = new Proxy<TableContext<{ id: string }>>(adapter, {
    get(_target, prop) {
        return currentView?.[prop as keyof TableView];
    },
    set() {
        throw new Error('tableContext is read-only!');
    },
    has(_target, prop) {
        return currentView ? prop in currentView : false;
    },
});
