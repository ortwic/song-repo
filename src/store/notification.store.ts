import { ArrayStore } from "./array.class";
import type { Notification, NotificationType } from '../model/notification.model';

function show(type: NotificationType, message: string, timeoutMs: number) {
    messageStack.unshift({ type, message });

    if (timeoutMs > 0) {
        setTimeout(() => messageStack.pop(), timeoutMs);
    }
}

export const messageStack = new ArrayStore<Notification>();
export const showInfo = (message: string, timeoutMs = 3000) => show('info', message, timeoutMs);
export const showWarn = (message: string, timeoutMs = 3000) => show('warn', message, timeoutMs);
export const showError = (message: string, timeoutMs = 3000) => show('error', message, timeoutMs);
