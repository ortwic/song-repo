
export function confirmed(event: Event) {
    if (event instanceof KeyboardEvent) {
        return event.key === undefined || event.key.toLowerCase() === 'enter';
    }
}

export function debounce(func: (...args: any[]) => any, wait: number) {
    let timeout: ReturnType<typeof setTimeout>;
    return function executedFunction(...args: any[]) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}