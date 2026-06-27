/**
 * Merges methods onto a data object as non-enumerable properties,
 * making them invisible to serializers like Firestore while still
 * accessible at runtime.
 */
export function defineMethods<TData extends object, TMethods extends Record<string, unknown>>(
    data: TData,
    methods: TMethods,
): TData & TMethods {
    for (const key of Object.keys(methods) as Array<keyof TMethods>) {
        Object.defineProperty(data, key, {
            value: methods[key],
            enumerable: false,
            writable: true,
            configurable: true,
        });
    }
    return data as TData & TMethods;
}