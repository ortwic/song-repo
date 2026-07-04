import { get as parseSignature } from '@tonaljs/time-signature';
import { createMetronome as create } from './metronome';
import type { MetronomeConfig } from './metronome.types';

const DEFAULT_TEMPO = 120;
const DEFAULT_BEATS_PER_BAR = 4;

// Notations-Symbole, die die Bibliothek nicht parst (regex erwartet
// "zahl/zahl" oder "zahl+zahl/zahl"). C = common time, C|/¢ = cut time.
const SIGNATURE_ALIASES: Record<string, string> = {
    C: '4/4',
    c: '4/4',
    'C|': '2/2',
    '¢': '2/2',
};

const TEMPO_MARKINGS: Record<string, number> = {
    larghissimo: 20,
    grave: 35,
    largo: 50,
    larghetto: 60,
    adagio: 70,
    adagietto: 75,
    andante: 90,
    moderato: 110,
    allegretto: 120,
    allegro: 140,
    vivace: 160,
    presto: 180,
    prestissimo: 200,
};

export function parseTempo(input: number | string): number {
    if (typeof input === 'string') {
        const value = input.trim().toLowerCase();
        if (value in TEMPO_MARKINGS) {
            return TEMPO_MARKINGS[value];
        }
    }
    
    const value = typeof input === 'string' ? Number(input) : input;
    return Number.isFinite(value) && value > 0 ? value : DEFAULT_TEMPO;
}

// ts.upper ist laut Quellcode (build()) zur Laufzeit immer bereits
// eine einzelne number (Array wird intern per reduce() summiert).
// Defensive Behandlung, da der TS-Typ number[] weiterhin zulässt.
function toNumber(value: number | number[]): number {
    return Array.isArray(value) ? value.reduce((sum, v) => sum + v, 0) : value;
}

export type Metronome = ReturnType<typeof createMetronome>;

export function createMetronome(
    timeSignature: string,
    config: Omit<MetronomeConfig, 'beatsPerBar'>
) {
    function getBeatsPerBar(timeSignature: string): number | undefined {
        const normalizedInput = SIGNATURE_ALIASES[timeSignature.trim()] ?? timeSignature.trim();
        try {
            const result = parseSignature(normalizedInput);
            if (!result.empty) {
                const upper = toNumber(result.upper);
                switch (result.type) {
                    case 'compound':
                        // lower===8 && upper%3===0 -> z.B. 6/8: upper=6 -> 2 Hauptzählzeiten
                        return upper / 3;

                    case 'simple':
                        // lower===4 || lower===2, unabhängig vom Zähler
                        return upper;

                    default:
                        return 0;
                }
            }
        } catch {
            console.warn(`Unable to parse time signature ${timeSignature}; using default value ${DEFAULT_BEATS_PER_BAR}`);
        }
    }
    
    const beatsPerBar = (timeSignature && getBeatsPerBar(timeSignature)) ?? DEFAULT_BEATS_PER_BAR;
    return create({ ...config, beatsPerBar });
}
