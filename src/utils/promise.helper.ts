import type { Action, ActionReturn } from "svelte/action";

export interface DeferredResult<T> {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: unknown) => void;
}

export function createDeferred<T>(): DeferredResult<T> {
    let resolve!: (value: T) => void;
    let reject!: (reason?: unknown) => void;

    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return { promise, resolve, reject };
}

export const wrapAsyncAction = <TElement extends HTMLElement, TParams>(
    createAction: (element: TElement, params: TParams) => Promise<ActionReturn<TParams>>
): Action<TElement, TParams> => ((element, params) => {
    const state: ActionReturn<TParams> & { destroyed: boolean } = { destroyed: false };

    createAction(element, params).then((result) => {
        if (!state.destroyed) {
            state.update = result.update;
            state.destroy = result.destroy;
        } else {
            result.destroy?.();
        }
    });

    return {
        update: (newParams) => state.update?.(newParams),
        destroy: () => {
            state.destroyed = true;
            state.destroy?.();
        }
    };
});