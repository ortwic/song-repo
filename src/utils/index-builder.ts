export type IndexEntry = {
    type?: string;
    value: string;
    count: number;
};

export function buildIndex<T>(
    items: T[],
    accessor: (item: T) => (string[] | undefined)[],
    type?: string
): Map<string, IndexEntry> {
    const map = new Map<string, IndexEntry>();

    for (const item of items) {
        const values = accessor(item).flat().filter(Boolean) as string[];
        for (const value of values) {
            const existing = map.get(value);
            map.set(value, { type, value, count: (existing?.count ?? 0) + 1 });
        }
    }

    return new Map([...map.entries()].sort((a, b) => b[1].count - a[1].count));
}
