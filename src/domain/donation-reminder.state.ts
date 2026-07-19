export default class DonationReminderState {
    private readonly storageKey: string;

    constructor(uid: string) {
        this.storageKey = `songrepo:donation-confirmed:${uid}`;
    }

    hasConfirmed(): boolean {
        try {
            return sessionStorage.getItem(this.storageKey) === 'true';
        } catch {
            return false;
        }
    }

    markConfirmed(): void {
        try {
            sessionStorage.setItem(this.storageKey, 'true');
        } catch {
            // ignore
        }
    }
}