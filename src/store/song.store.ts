import { writable } from "svelte/store";
import type { Song } from "../model/song.model";

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

    public update(items: T[]): void {
        
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

export const songs = new ArrayStore<Song>();