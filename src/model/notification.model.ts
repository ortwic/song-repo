export type NotificationType = 'info' | 'warn' | 'error';

export interface Notification {
    type: NotificationType;
    message: string;
    timeout?: number;
}
