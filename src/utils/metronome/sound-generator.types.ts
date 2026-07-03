export interface SoundOptions {
    /** AudioContext time at which the sound should play. */
    time: number;
    /** Whether this is the first beat of a bar (plays the bell sound instead of the click). */
    isAccent: boolean;
    /** Volume in the 0–1 range. */
    volume: number;
}

// --- Regular click (non-accent beats) ---
// Two layers: a short filtered noise transient for a percussive "tick" edge,
// plus a slightly longer sine tone underneath for a defined pitch. This is a
// common layering technique for synthesized percussion sounds, not a
// physically measured "correct" click — tune to taste.
export interface SoundConfig {
    /** Frequency of the sine tone body, in Hz. */
    toneFrequencyHz: number;
    /** Duration of the tone body's decay, in seconds. */
    toneDurationSeconds: number;
    /** Tone body volume, relative to the overall `volume` passed to `play()`. */
    toneGainRatio: number;
    /** Highpass cutoff frequency for the noise transient, in Hz. Higher = brighter/thinner "tick". */
    noiseFilterFrequencyHz: number;
    /** Q (resonance) of the noise highpass filter. Keep low (~1) to avoid the filter ringing into a tone. */
    noiseFilterQ: number;
    /** Duration of the noise transient's decay, in seconds. */
    noiseDurationSeconds: number;
    /** Noise transient volume, relative to the overall `volume` passed to `play()`. */
    noiseGainRatio: number;
}

// --- Accent "bling" (first beat of bar) ---
// Additive synthesis with inharmonic partials to approximate a bell-like
// timbre. Ratios and gains are a tunable design choice, not a physically
// measured bell model — adjust freely to taste.
export interface AccentSoundConfig {
    /** Fundamental frequency of the bell tone, in Hz. */
    fundamentalHz: number;
    /** Frequency ratios (relative to fundamentalHz) for each inharmonic partial. */
    partialRatios: readonly number[];
    /** Volume ratio (relative to the overall `volume` passed to `play()`) for each partial, same order as partialRatios. */
    partialGains: readonly number[];
    /** Duration of the bell's decay, in seconds. */
    durationSeconds: number;
}

export interface SoundGeneratorConfig {
    click?: Partial<SoundConfig>;
    accent?: Partial<AccentSoundConfig>;
}