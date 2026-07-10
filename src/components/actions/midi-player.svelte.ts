import { Midi } from '@tonejs/midi';
import * as Tone from 'tone';

export function createMidiPlayer() {
    let synth: Tone.PolySynth | null = null;
    let midi: Midi | null = null;
    let parts: Tone.Part[] = [];
    let stopEventId: number | null = null;

    let isReady = $state(false);
    let isPlaying = $state(false);

    function createPartsFromMidi(midiData: Midi, instrument: Tone.PolySynth): Tone.Part[] {
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
        synth = new Tone.PolySynth(Tone.Synth).toDestination();

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