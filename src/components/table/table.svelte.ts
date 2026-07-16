import type { Action } from 'svelte/action';
import type { TableParams, TableView } from './table.action';
import { wrapAsyncAction } from '../../utils/promise.helper';

let currentView: TableView | undefined = $state();

const tableAdapter = wrapAsyncAction<HTMLElement, TableParams<RowData>>(async (element, params) => {
    const { createTable } = await import('./table.action');
    return createTable(element, {
        ...params,
        onInit(view: TableView) {
            params.onInit?.(view);
            currentView = view;
        },
        onDestroy() {
            params.onDestroy?.();
            currentView = undefined;
        }
    });
});


type RowData = { id: string }; 
type TableContext<T> = Partial<TableView> & Action<HTMLElement, TableParams<T>>;

export const tableContext = new Proxy<TableContext<RowData>>(tableAdapter, {
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
