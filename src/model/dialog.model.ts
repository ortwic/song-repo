export interface Dialog<T> {
    showDialog(param: T): Promise<string>;
}
