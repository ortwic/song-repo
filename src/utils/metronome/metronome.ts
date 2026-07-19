import type { MetronomeConfig, MetronomeState, MetronomeUpdateConfig } from './metronome.types';
import { createSoundGenerator, type SoundGenerator } from './sound-generator';

const noop = () => {};

/**
 * Creates a metronome instance with the specified configuration.
 *
 * At its simplest, the metronome will play a click sound at a specified tempo (in BPM) and beats per bar.
 * You can optionally also configure additional events:
 *
 * - `onBeatStart`:   A callback that fires at the start of each beat.
 *                    Useful to trigger visual cues or other events.
 *
 * - `maxBeats`:      A configuration that allows you to set the total number of beats
 *                    before the metronome stops automatically.
 *                    This includes an optional `onEnd` callback that fires when the metronome stops.
 *
 * - `beatInterval`:  A configuration that allows you to set a specific interval of beats
 *                    to trigger an event. For example, you can set it to fire every 4 beats.
 *                    This includes an `onBeatInterval` callback that fires at the specified interval.
 *                    As a tangible example, you might want to cycle through a set of notes
 *                    changing the note at the start of each measure.
 *                    Setting `count` to 4 will fire the event on beats 1, 5, 9, 13, etc.
 *                    This removes some of the bookkeeping you'd need to do on your end.
 *
 * Sound synthesis (click and accent) lives in `sound-generator.ts` — this module
 * only handles tempo, beat counting, and Web Audio API lookahead scheduling.
 *
 * The metronome can be started, stopped, paused, resumed, and destroyed.
 * You can also update the tempo and volume after creation.
 *
 * Call `destroy()` once the metronome is no longer needed (e.g. on component unmount)
 * to release the AudioContext and any pending timers.
 */
export function createMetronome(config: MetronomeConfig) {
    const state: MetronomeState = {
        playbackState: 'stopped',
        currentBeat: 0,
        totalBeats: 0,
        currentInterval: 0,
        nextNoteTime: 0,
        audioContext: null,
        timerID: null,
        lookaheadMs: 25.0, // 25ms lookahead
    };

    let tempo = config.tempo;
    let beatsPerBar = config.beatsPerBar;
    let volume = config.volume / 100; // Convert to 0-1 range
    let onBeatStart = config.onBeatStart || noop;
    let maxBeatsConfig = config.maxBeats || null;
    let beatIntervalConfig = config.beatInterval || null;
    let soundGenerator: SoundGenerator | null = null;
    let isDestroyed = false;

    // Calculate beat length in seconds based on tempo (BPM)
    const getBeatLength = () => 60.0 / tempo;

    // Create and configure audio context and click sound generator if they don't exist
    const initializeAudioContext = () => {
        if (isDestroyed) {
            throw new Error('Cannot use a metronome instance after destroy() has been called.');
        }

        if (!state.audioContext) {
            state.audioContext = new AudioContext();
            soundGenerator = createSoundGenerator(state.audioContext, config.soundConfig);
        }

        return state.audioContext;
    };

    // Generate a click sound and fire beat callbacks at the specified time
    const scheduleNote = (time: number) => {
        if (!state.audioContext || !soundGenerator) return;

        const isFirstBeatOfBar = beatsPerBar > 0 && state.currentBeat % beatsPerBar === 0;
        if (isFirstBeatOfBar) {
            soundGenerator.playAccent({ time, volume });
        } else {
            soundGenerator.playClick({ time, volume });
        }

        // Calculate the actual beat number (1-based) to pass to the callback
        const beatNumber = (state.currentBeat % beatsPerBar) + 1;

        // Create a separate, silent oscillator purely for precise callback timing.
        // The audio clock is far more accurate than setTimeout, so we piggyback
        // on its `onended` event to fire onBeatStart exactly in sync with the click.
        const callbackTrigger = state.audioContext.createOscillator();
        callbackTrigger.frequency.value = 1;

        callbackTrigger.onended = () => {
            onBeatStart({
                beatNumber,
                time,
                totalBeats: state.totalBeats,
            });

            // Check if we need to fire interval event
            if (beatIntervalConfig) {
                // For count=4, this should fire on beats 1, 5, 9, 13, etc.
                // We want to fire when we're on the first beat of a measure AND
                // we've completed the right number of intervals
                if (isFirstBeatOfBar && state.totalBeats % beatIntervalConfig.count === 1) {
                    beatIntervalConfig.onBeatInterval({
                        currentInterval: state.currentInterval,
                    });

                    // Increment interval counter
                    state.currentInterval += 1;
                }
            }
        };

        // Schedule it to start and stop immediately at the exact time of the beat
        callbackTrigger.start(time);
        callbackTrigger.stop(time + 0.001); // Minimal duration to trigger onended
    };

    // Schedule notes ahead of time
    const scheduler = () => {
        if (!state.audioContext) return;

        // Convert lookahead from ms to seconds for audio scheduling
        const scheduleAheadTimeSec = state.lookaheadMs / 1000;

        // Schedule notes until we're a little ahead
        while (state.nextNoteTime < state.audioContext.currentTime + scheduleAheadTimeSec) {
            // Check if we've reached the maximum beats
            if (maxBeatsConfig !== null && state.totalBeats >= maxBeatsConfig.count) {
                // Schedule the onEnd event to fire after the last beat completes
                // We want it to fire exactly at the time when the next beat would start
                if (state.audioContext) {
                    const endTime = state.nextNoteTime;

                    // Create a silent oscillator to trigger the onEnd event at the precise time
                    const endTrigger = state.audioContext.createOscillator();
                    endTrigger.frequency.value = 1; // Minimal frequency

                    // Set up the event to fire exactly when the last beat would end
                    endTrigger.onended = () => {
                        if (maxBeatsConfig?.onEnd) {
                            maxBeatsConfig.onEnd();
                        }
                        stop();
                    };

                    // Schedule it to start and stop at the end time
                    endTrigger.start(endTime);
                    endTrigger.stop(endTime + 0.001);
                }

                // Exit the scheduler loop
                return;
            }

            scheduleNote(state.nextNoteTime);

            // Advance beat and time
            state.currentBeat = (state.currentBeat + 1) % beatsPerBar;
            state.totalBeats += 1;
            state.nextNoteTime += getBeatLength();
        }

        // Schedule next check
        state.timerID = window.setTimeout(scheduler, state.lookaheadMs);
    };

    // Start the metronome
    const start = () => {
        if (isDestroyed || state.playbackState === 'playing') return;

        const audioContext = initializeAudioContext();

        if (state.playbackState === 'stopped') {
            // Not resuming, so reset the beat counters
            state.currentBeat = 0;
            state.totalBeats = 0;
            state.currentInterval = 0;
        }

        state.playbackState = 'playing';
        state.nextNoteTime = audioContext.currentTime;

        scheduler();
    };

    // Stop the metronome
    const stop = () => {
        if (state.playbackState === 'stopped') return;

        state.playbackState = 'stopped';
        state.currentBeat = 0; // Reset beat counter
        state.totalBeats = 0; // Reset total beats counter
        state.currentInterval = 0; // Reset interval counter

        if (state.timerID !== null) {
            window.clearTimeout(state.timerID);
            state.timerID = null;
        }
    };

    // Pause the metronome - maintains current beat position
    const pause = () => {
        if (state.playbackState !== 'playing') return;

        state.playbackState = 'paused';

        // Stop the scheduler
        if (state.timerID !== null) {
            window.clearTimeout(state.timerID);
            state.timerID = null;
        }
    };

    // Resume the metronome from paused state
    const resume = () => {
        if (state.playbackState !== 'paused') return;

        // We don't automatically advance the beat when resuming anymore
        // This maintains the correct position in the measure

        // Use start to handle the resumed state
        start();
    };

    /**
     * Update specified values of the metronome after creation.
     */
    const updateConfig = (newConfig: Partial<MetronomeUpdateConfig>) => {
        if (newConfig.tempo !== undefined) {
            tempo = newConfig.tempo;
        }

        if (newConfig.volume !== undefined) {
            volume = newConfig.volume / 100;
        }
    };

    /**
     * Permanently releases the metronome's resources: stops playback,
     * clears any pending timers, and closes the underlying AudioContext.
     *
     * Call this once the metronome is no longer needed (e.g. on component
     * unmount / effect cleanup). After calling destroy(), the instance
     * must not be used again — calling start() afterwards throws.
     */
    const destroy = () => {
        if (isDestroyed) return;

        stop();

        if (state.audioContext) {
            // closing an AudioContext releases its underlying audio hardware resources
            void state.audioContext.close();
        }

        state.audioContext = null;
        soundGenerator = null;
        onBeatStart = noop;
        maxBeatsConfig = null;
        beatIntervalConfig = null;
        isDestroyed = true;
    };

    // Get current state
    const getState = () => ({
        playbackState: state.playbackState,
        tempo,
        beatsPerBar,
        volume: volume * 100,
        currentBeat: state.currentBeat,
        totalBeats: state.totalBeats,
        currentInterval: state.currentInterval,
        maxBeats: maxBeatsConfig ? maxBeatsConfig.count : null,
        beatInterval: beatIntervalConfig ? beatIntervalConfig.count : null,
        isDestroyed,
    });

    return {
        start,
        stop,
        pause,
        resume,
        destroy,
        updateConfig,
        getState,
    };
}

export type Metronome = ReturnType<typeof createMetronome>;