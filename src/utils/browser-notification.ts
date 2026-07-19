import { showWarn } from '../store/notification.store';
import { createSoundGenerator } from './metronome/sound-generator';

export type Formatter<T> = (request: T) => { title: string; message: string };

export function initBrowserNotification(iconUrl: string, volume = 0.5) {
    const audioContext = new AudioContext();
    const soundGenerator = createSoundGenerator(audioContext);

    // should be done right after user interaction
    audioContext.resume().catch(() => {
        // will be retried later
    });

    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission();
    }

    function dispose(): void {
        audioContext.close();
    }

    function send<T>(requests: T[], formatter: Formatter<T>): void {
        if (requests.length > 0) {
            let { title, message } = formatter(requests[0]);
            if (requests.length > 1) {
                message += ` (+${requests.length - 1})`;
            }
            show(title, message);
            playChime();
        }
    }

    function show(title: string, body: string): void {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification(title, { body, icon: iconUrl });
        }
    }

    function playChime(): void {
        audioContext.resume()
            .then(() => soundGenerator.playAccent({ time: audioContext.currentTime, volume }))
            .catch(() => showWarn('Could not play notification sound; check your browser settings.'));
    }

    return {
        dispose,
        send,
    };
}