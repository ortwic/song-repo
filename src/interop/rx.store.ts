import { Observable } from 'rxjs';
import { type Readable, readable } from 'svelte/store';

export function toStore<T>(source: Observable<T> | Promise<T>, initialValue?: T): Readable<T> {
    return readable<T>(initialValue, (set) => {
        if (source instanceof Observable) {
            const sub = source.subscribe({
                next: set,
                error: console.error,
            });
            return () => sub.unsubscribe();
        }
        source.then(set).catch(console.error);
    });
}
