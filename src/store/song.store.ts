import { writable } from "svelte/store";
import { findIndex } from "lodash";
import type { UserSong } from "../model/song.model";

class ArrayStore<T> {
    private _store = writable([] as T[]);
    
    public subscribe = (callback: (items: T[]) => void) => {
        return this._store.subscribe(callback);
    };
  
    public push(...newItems: T[]): void {
        this._store.update(items => [...items, ...newItems]);
    }

    public unshift(...newItems: T[]): void {
        this._store.update(items => [...newItems, ...items]);
    }
  
    public pop(): T {
        let popped: T;
        this._store.update(items => {
            if (items.length > 0) {
                popped = items[items.length - 1];
                return items.slice(0, -1);
            } else {
                return items;
            }
        });
        return popped;
    }

    public replace(newItem: T, keyProp: keyof T): void {
        this._store.update(items => {
            const index = findIndex(items, (item: T) => item[keyProp] === newItem[keyProp]);

            if (index !== -1) {
                items[index] = newItem;
            } else {
                items.push(newItem);
            }
    
            return items;
        });
    }

    public set(items: T[]): void {
        this._store.set(items);
    }
  
    public get length(): number {
        let length = 0;
        this._store.subscribe(items => length = items.length)();
        return length;
    }

    public get isEmpty(): boolean {
        return this.length < 1;
    }
}

export const usersongs = new ArrayStore<UserSong>();