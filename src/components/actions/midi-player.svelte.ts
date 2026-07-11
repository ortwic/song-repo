import { Midi } from '@tonejs/midi';
import * as Tone from 'tone';

export function createMidiPlayer() {
    let synth: Tone.Sampler | null = null;
    let midi: Midi | null = null;
    let parts: Tone.Part[] = [];
    let stopEventId: number | null = null;

    let isReady = $state(false);
    let isPlaying = $state(false);

    function createPartsFromMidi(midiData: Midi, instrument: Tone.Sampler): Tone.Part[] {
        return midiData.tracks.map(track => {
            const part = new Tone.Part((time, note) => {
                instrument.triggerAttackRelease(note.name, note.duration, time, note.velocity);
            }, track.notes);
            part.start(0);
            return part;
        });
    }

    function scheduleAutoStop(duration: number) {
        if (stopEventId !== null) {
            Tone.getTransport().clear(stopEventId);
        }

        stopEventId = Tone.getTransport().scheduleOnce(() => {
            resetPlayback();
        }, duration);
    }

    function resetPlayback(): void {
        // stop() rewinds the transport to position 0 (unlike pause(), which keeps
        // the current position) — required so the track can be replayed after it finished
        Tone.getTransport().stop();
        synth?.releaseAll();
        isPlaying = false;
    }

    function pausePlayback(): void {
        // pause() keeps the current position, so playback can resume from there
        Tone.getTransport().pause();
        synth?.releaseAll();
        isPlaying = false;
    }

    async function load(midiUrl: string): Promise<void> {
        synth = new Tone.Sampler({
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
        parts = createPartsFromMidi(midi, synth);
        scheduleAutoStop(midi.duration);
        isReady = true;
    }

    async function toggle(): Promise<void> {
        if (midi && synth) {
            await Tone.start(); // must happen inside a user-gesture handler

            if (isPlaying) {
                pausePlayback();
            } else {
                scheduleAutoStop(midi.duration);
                Tone.getTransport().start();
                isPlaying = true;
            }
        }
    }

    function dispose(): void {
        // Note: Tone.getTransport() is a single global instance shared by the whole app.
        // Stopping/cancelling it here affects any other component scheduling on the
        // same transport. Fine for a standalone player, worth knowing if reused elsewhere.
        Tone.getTransport().stop();
        Tone.getTransport().cancel();
        parts.forEach(part => part.dispose());
        parts = [];
        synth?.dispose();
        synth = null;
    }

    return {
        get isReady() { return isReady; },
        get isPlaying() { return isPlaying; },
        load,
        toggle,
        dispose
    };
}