export interface Dialog<T> {
    open(initial?: T): Promise<T>;
}
