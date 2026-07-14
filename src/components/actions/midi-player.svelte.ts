import type { Midi as MidiType } from '@tonejs/midi';
import type * as Tone from 'tone';

export function createMidiPlayer() {
    let toneModule: typeof Tone | null = null;
    let synth: Tone.Sampler | null = null;
    let midi: MidiType | null = null;
    let parts: Tone.Part[] = [];
    let stopEventId: number | null = null;

    let isReady = $state(false);
    let isPlaying = $state(false);

    async function loadTone(): Promise<typeof Tone> {
        if (!toneModule) {
            toneModule = await import('tone');
        }
        return toneModule;
    }

    function createPartsFromMidi(midiData: MidiType, instrument: Tone.Sampler, toneNs: typeof Tone): Tone.Part[] {
        return midiData.tracks.map(track => {
            const part = new toneNs.Part((time, note) => {
                instrument.triggerAttackRelease(note.name, note.duration, time, note.velocity);
            }, track.notes);
            part.start(0);
            return part;
        });
    }

    function scheduleAutoStop(toneNs: typeof Tone, duration: number): void {
        if (stopEventId !== null) {
            toneNs.getTransport().clear(stopEventId);
        }

        stopEventId = toneNs.getTransport().scheduleOnce(() => {
            resetPlayback(toneNs);
        }, duration);
    }

    function resetPlayback(toneNs: typeof Tone): void {
        // stop() rewinds the transport to position 0 (unlike pause(), which keeps
        // the current position) — required so the track can be replayed after it finished
        toneNs.getTransport().stop();
        synth?.releaseAll();
        isPlaying = false;
    }

    function pausePlayback(toneNs: typeof Tone): void {
        // pause() keeps the current position, so playback can resume from there
        toneNs.getTransport().pause();
        synth?.releaseAll();
        isPlaying = false;
    }

    async function load(midiUrl: string): Promise<void> {
        const toneNs = await loadTone();
        const { Midi } = await import('@tonejs/midi');

        synth = new toneNs.Sampler({
            urls: {
                A0: 'A0.mp3', C1: 'C1.mp3', 'D#1': 'Ds1.mp3', 'F#1': 'Fs1.mp3', A1: 'A1.mp3',
                C2: 'C2.mp3', 'D#2': 'Ds2.mp3', 'F#2': 'Fs2.mp3', A2: 'A2.mp3',
                C3: 'C3.mp3', 'D#3': 'Ds3.mp3', 'F#3': 'Fs3.mp3', A3: 'A3.mp3',
                C4: 'C4.mp3', 'D#4': 'Ds4.mp3', 'F#4': 'Fs4.mp3', A4: 'A4.mp3',
                C5: 'C5.mp3', 'D#5': 'Ds5.mp3', 'F#5': 'Fs5.mp3', A5: 'A5.mp3',
                C6: 'C6.mp3', 'D#6': 'Ds6.mp3', 'F#6': 'Fs6.mp3', A6: 'A6.mp3',
                C7: 'C7.mp3', 'D#7': 'Ds7.mp3', 'F#7': 'Fs7.mp3', A7: 'A7.mp3',
                C8: 'C8.mp3'
            },
            release: 1,
            baseUrl: 'https://tonejs.github.io/audio/salamander/',
            onload: () => { isReady = true; }
        }).toDestination();

        midi = await Midi.fromUrl(midiUrl); // already fully parsed, no separate load() call exists
        parts = createPartsFromMidi(midi, synth, toneNs);
        scheduleAutoStop(toneNs, midi.duration);
        isReady = true;
    }

    async function toggle(): Promise<void> {
        if (midi && synth) {
            const toneNs = await loadTone();
            await toneNs.start(); // must happen inside a user-gesture handler

            if (isPlaying) {
                pausePlayback(toneNs);
            } else {
                scheduleAutoStop(toneNs, midi.duration);
                toneNs.getTransport().start();
                isPlaying = true;
            }
        }
    }

    function dispose(): void {
        if (toneModule) {
            // Note: Tone.getTransport() is a single global instance shared by the whole app.
            // Stopping/cancelling it here affects any other component scheduling on the
            // same transport. Fine for a standalone player, worth knowing if reused elsewhere.
            toneModule.getTransport().stop();
            toneModule.getTransport().cancel();
            parts.forEach(part => part.dispose());
            parts = [];
            synth?.dispose();
            synth = null;
        }
    }

    return {
        get isReady() { return isReady; },
        get isPlaying() { return isPlaying; },
        load,
        toggle,
        dispose
    };
}