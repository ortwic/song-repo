import { get } from "svelte/store";
import { t } from "svelte-i18n";
import { showError, showInfo } from "../../../store/notification.store";

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

export async function toClipboard(text: string): Promise<void> {
    try {
        await navigator.clipboard.writeText(text);
        showInfo(get(t)('profile.share-link-copied'));
    } catch (error) {
        showError(error);
    }
}