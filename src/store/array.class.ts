import { writable } from 'svelte/store';

export class ArrayStore<T> {
    private _store = writable([] as T[]);

    public subscribe = (callback: (items: T[]) => void) => {
        return this._store.subscribe(callback);
    };

    public push(...newItems: T[]): void {
        this._store.update((items) => [...items, ...newItems]);
    }

    public unshift(...newItems: T[]): void {
        this._store.update((items) => [...newItems, ...items]);
    }

    public shift(): T {
        let shifted: T;
        this._store.update((items) => {
            if (items.length > 0) {
                shifted = items[0];
                return items.slice(1, items.length);
            } else {
                return items;
            }
        });
        return shifted;
    }

    public pop(): T {
        let popped: T;
        this._store.update((items) => {
            if (items.length > 0) {
                popped = items[items.length - 1];
                return items.slice(0, -1);
            } else {
                return items;
            }
        });
        return popped;
    }

    public set(items: T[]): void {
        this._store.set(items);
    }

    public exists(key: keyof T, value: unknown): boolean {
        let result: unknown;
        this._store.subscribe((items) => (result = items.map(v => v[key]).find(v => v === value)))();
        return !!result;
    }

    public get length(): number {
        let length = 0;
        this._store.subscribe((items) => (length = items.length))();
        return length;
    }

    public get isEmpty(): boolean {
        return this.length < 1;
    }
}
