import { get as parseSignature } from '@tonaljs/time-signature';

const DEFAULT_TEMPO = 120;
const DEFAULT_BEATS_PER_BAR = 4;

export interface MetronomeParams {
  tempo: number;
  beatsPerBar: number;
}

// Notations-Symbole, die die Bibliothek nicht parst (regex erwartet
// "zahl/zahl" oder "zahl+zahl/zahl"). C = common time, C|/¢ = cut time.
const SIGNATURE_ALIASES: Record<string, string> = {
  'C': '4/4',
  'c': '4/4',
  'C|': '2/2',
  '¢': '2/2',
};

function parseBpm(input: number | string): number {
  const value = typeof input === 'string' ? Number(input) : input;
  if (!Number.isFinite(value) || value <= 0) {
    return DEFAULT_TEMPO;
  }
  return value;
}

// ts.upper ist laut Quellcode (build()) zur Laufzeit immer bereits
// eine einzelne number (Array wird intern per reduce() summiert).
// Defensive Behandlung, da der TS-Typ number[] weiterhin zulässt.
function toNumber(value: number | number[]): number {
  return Array.isArray(value) ? value.reduce((sum, v) => sum + v, 0) : value;
}

export function normalizeSignature(
  bpm: number | string,
  timeSignature: string
): MetronomeParams {
  const tempo = parseBpm(bpm);
  const fallback: MetronomeParams = { tempo, beatsPerBar: DEFAULT_BEATS_PER_BAR };

  const normalizedInput = SIGNATURE_ALIASES[timeSignature.trim()] ?? timeSignature.trim();

  try {
    const ts = parseSignature(normalizedInput);

    if (ts.empty) {
      return fallback;
    }

    const upper = toNumber(ts.upper);

    switch (ts.type) {
      case 'compound':
        // lower===8 && upper%3===0 -> z.B. 6/8: upper=6 -> 2 Hauptzählzeiten
        return { tempo, beatsPerBar: upper / 3 };

      case 'simple':
        // lower===4 || lower===2, unabhängig vom Zähler
        return { tempo, beatsPerBar: upper };

      case 'irregular':
      case 'irrational':
        // additive Taktarten, /16-Compound-Fälle, nicht-Zweierpotenz-Nenner
        // -> keine eindeutige Hauptzählzeit-Logik, Default statt Rateversuch
        return fallback;

      default:
        return fallback;
    }
  } catch {
    return fallback;
  }
}