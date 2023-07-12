import { ArrayStore } from './array.class';
import type {
    Notification,
    NotificationType,
} from '../model/notification.model';

const defaultTimeout = 3;

function show(type: NotificationType, message: string, timeoutSec: number) {
    messageStack.unshift({ type, message });

    if (timeoutSec > 0) {
        setTimeout(() => messageStack.pop(), timeoutSec * 1000);
    }
}

export const messageStack = new ArrayStore<Notification>();
export const showInfo = (message: string, timeoutSec = defaultTimeout) =>
    show('info', message, timeoutSec);
export const showWarn = (message: string, timeoutSec = defaultTimeout) =>
    show('warn', message, timeoutSec);
export const showError = (message: string, timeoutSec = defaultTimeout) =>
    show('error', message, timeoutSec);
