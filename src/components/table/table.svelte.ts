import type { Action, ActionReturn } from 'svelte/action';
import type { TableParams, TableView } from './table.action';

let currentView: TableView | undefined = $state();

const adapter = <T>(element: HTMLElement, params: TableParams<T>) => {
    let result: ActionReturn<TableParams<T>> = {};
    const createTableAdapter = ({ createTable }) => {
        const { update, destroy } = createTable(element, { 
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
        result.update = update;
        result.destroy = destroy;
    };
    
    import('./table.action').then(createTableAdapter);
    return result;
};

type RowData = { id: string }; 
type TableContext<T> = Partial<TableView> & Action<HTMLElement, TableParams<T>>;
export const tableContext = new Proxy<TableContext<RowData>>(adapter, {
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
