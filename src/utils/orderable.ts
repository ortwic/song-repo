export interface Orderable {
    id: string;
    order?: number;
}

export interface OrderUpdate {
    id: string;
    order: number;
}

/**
 * Computes a safe order value for a new item appended to the list.
 */
export function nextOrder<T extends Orderable>(items: T[]): number {
    const existingOrders = items.map((item) => item.order).filter((order): order is number => order !== undefined);

    if (existingOrders.length === 0) {
        return items.length;
    }

    return Math.max(...existingOrders) + 1;
}

/**
 * Computes the new order values for swapping two adjacent items.
 * Returns null if the target index is out of bounds.
 */
export function swapOrder<T extends Orderable>(items: T[], index: number, direction: -1 | 1): OrderUpdate[] | null {
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= items.length) {
        return null;
    }

    const a = items[index];
    const b = items[swapIndex];

    const orderA = a.order ?? index;
    const orderB = b.order ?? swapIndex;

    return [
        { id: a.id, order: orderB },
        { id: b.id, order: orderA },
    ];
}
