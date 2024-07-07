import { logEvent } from 'firebase/analytics';
import { ArrayStore } from './array.class';
import type { Notification, NotificationType } from '../model/notification.model';
import { analytics } from '../service/auth.service';

const defaultTimeout = 3;

function show(type: NotificationType, message: string, timeoutSec: number) {
    console[type](message);
    log('notification', { [type]: message });

    if (!messageStack.exists('message', message)) {
        messageStack.unshift({ type, message });

        if (timeoutSec > 0) {
            setTimeout(() => messageStack.pop(), timeoutSec * 1000);
        }
    }
}

export const messageStack = new ArrayStore<Notification>();
export const showInfo = (message: string, timeoutSec = defaultTimeout) => show('info', message, timeoutSec);
export const showWarn = (message: string, timeoutSec = defaultTimeout) => show('warn', message, timeoutSec);
export const showError = (message: string, timeoutSec = defaultTimeout) => show('error', message, timeoutSec);

export const logPageView = (event: { [key: string]: unknown; }) => log('page_view', event);
export const logAction = (event: { [key: string]: unknown; }) => log('user_engagement', event);
export const log = (eventName: string, eventParams: { [key: string]: unknown; }) => {
    if (!import.meta.env.DEV) {
        logEvent(analytics, eventName, eventParams);
    }
};
