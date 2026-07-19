/**
 * Generates the audible sounds for the metronome: a short click for regular
 * beats, and a bell-like "bling" tone for accented beats (first beat of a bar).
 *
 * Responsible only for sound synthesis (oscillators + gain envelopes).
 * Does not know anything about tempo, beat counting, or scheduling —
 * that stays in the metronome itself.
 *
 * All musically/perceptually relevant parameters are configurable via
 * `createSoundGenerator(audioContext, config)`. Anything omitted falls back
 * to the DEFAULT_* values below.
 */

import type { AccentSoundConfig, SoundConfig, SoundGeneratorConfig, SoundOptions } from "./sound-generator.types";

const DEFAULT_CLICK_CONFIG: SoundConfig = {
    toneFrequencyHz: 800,
    toneDurationSeconds: 0.04,
    toneGainRatio: 0.4,
    noiseFilterFrequencyHz: 2000,
    noiseFilterQ: 1,
    noiseDurationSeconds: 0.015,
    noiseGainRatio: 0.6,
};

const DEFAULT_ACCENT_CONFIG: AccentSoundConfig = {
    fundamentalHz: 1200,
    partialRatios: [1, 2.4, 3.8],
    partialGains: [1, 0.5, 0.25],
    durationSeconds: 0.4,
};

// Fixed implementation detail, not exposed as config: the near-zero target
// value for exponential gain ramps. The Web Audio API requires this to be
// > 0 for exponentialRampToValueAtTime — it is not a musically meaningful
// parameter, just a technical necessity.
const GAIN_RAMP_TARGET = 0.001;

// Must be >= the longest possible noise transient duration.
const NOISE_BUFFER_DURATION_SECONDS = 0.05;

/**
 * Creates a short white-noise buffer used as the source for the click's
 * noise transient. Generated once per AudioContext and reused for every
 * click, since AudioBufferSourceNode is single-use but AudioBuffer is not.
 */
function createNoiseBuffer(audioContext: AudioContext, minDurationSeconds: number): AudioBuffer {
    const durationSeconds = Math.max(minDurationSeconds, NOISE_BUFFER_DURATION_SECONDS);
    const bufferLength = Math.ceil(audioContext.sampleRate * durationSeconds);
    const buffer = audioContext.createBuffer(1, bufferLength, audioContext.sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < bufferLength; i++) {
        channelData[i] = Math.random() * 2 - 1;
    }

    return buffer;
}

/**
 * Creates a sound generator bound to a given AudioContext.
 *
 * @param config Optional overrides for click and accent sound parameters.
 *               Anything omitted uses the DEFAULT_CLICK_CONFIG / DEFAULT_ACCENT_CONFIG values.
 */
export function createSoundGenerator(audioContext: AudioContext, config: SoundGeneratorConfig = {}) {
    const clickConfig: SoundConfig = { ...DEFAULT_CLICK_CONFIG, ...config.click };
    const accentConfig: AccentSoundConfig = { ...DEFAULT_ACCENT_CONFIG, ...config.accent };

    const noiseBuffer = createNoiseBuffer(audioContext, clickConfig.noiseDurationSeconds);

    const playClick = ({ time, volume }: SoundOptions): void => {
        // Layer 1: filtered noise transient — the percussive "tick" edge
        const noiseSource = audioContext.createBufferSource();
        noiseSource.buffer = noiseBuffer;

        const noiseFilter = audioContext.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = clickConfig.noiseFilterFrequencyHz;
        noiseFilter.Q.value = clickConfig.noiseFilterQ;

        const noiseGain = audioContext.createGain();
        const noiseVolume = volume * clickConfig.noiseGainRatio;
        noiseGain.gain.setValueAtTime(noiseVolume, time);
        noiseGain.gain.exponentialRampToValueAtTime(GAIN_RAMP_TARGET, time + clickConfig.noiseDurationSeconds);

        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(audioContext.destination);

        noiseSource.start(time);
        noiseSource.stop(time + clickConfig.noiseDurationSeconds);

        // Layer 2: short sine tone — gives the click a defined pitch
        const oscillator = audioContext.createOscillator();
        const toneGain = audioContext.createGain();

        oscillator.frequency.value = clickConfig.toneFrequencyHz;

        const toneVolume = volume * clickConfig.toneGainRatio;
        toneGain.gain.setValueAtTime(toneVolume, time);
        toneGain.gain.exponentialRampToValueAtTime(GAIN_RAMP_TARGET, time + clickConfig.toneDurationSeconds);

        oscillator.connect(toneGain);
        toneGain.connect(audioContext.destination);

        oscillator.start(time);
        oscillator.stop(time + clickConfig.toneDurationSeconds);
    };

    const playAccent = ({ time, volume }: SoundOptions): void => {
        accentConfig.partialRatios.forEach((ratio, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.value = accentConfig.fundamentalHz * ratio;

            const partialGainRatio = accentConfig.partialGains[index] ?? 0;
            const partialVolume = volume * partialGainRatio;

            gainNode.gain.setValueAtTime(partialVolume, time);
            gainNode.gain.exponentialRampToValueAtTime(GAIN_RAMP_TARGET, time + accentConfig.durationSeconds);

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.start(time);
            oscillator.stop(time + accentConfig.durationSeconds);
        });
    };

    return { playAccent, playClick };
}

export type SoundGenerator = ReturnType<typeof createSoundGenerator>;