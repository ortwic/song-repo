/**
 * Merges methods onto a data object as non-enumerable properties,
 * making them invisible to serializers like Firestore while still
 * accessible at runtime.
 */
export function defineMethods<TData extends object, TMethods extends Record<string, unknown>>(
    data: TData,
    methods: TMethods,
): TData & TMethods {
    for (const key of Object.keys(methods) as Array<keyof TMethods>) {
        Object.defineProperty(data, key, {
            value: methods[key],
            enumerable: false,
            writable: true,
            configurable: true,
        });
    }
    return data as TData & TMethods;
}

/**
 * Generates a stable, URL-safe Firestore document ID from one or more parts.
 *
 * Parts are normalized individually before joining with "-" to prevent
 * collisions like ("The Beatles" + "Help") vs ("The" + "BeatlesHelp").
 *
 * Examples:
 *   docId("Erik Satie", "Gymnopédie No. 1") → "eriksatie-gymnopedie-no1"
 *   docId("Yann Tiersen", "Comptine d'un autre été") → "yanntiersen-comptinedunautreete"
 *   docId("Hans Zimmer", "Time (Inception)") → "hanszimmer-time"
 */
export function docId(...params: string[]): string {
    return params.map(normalizePart).join('-');
}

/**
 * Normalizes a single string part for use in a Firestore document ID or slug.
 *
 * Transformations applied in order:
 * 1. Strip parenthetical subtitles — "(Inception)" in "Time (Inception)"
 * 2. Transliterate diacritics via NFD decomposition — "é" → "e"
 * 3. Remove apostrophes/backticks — "gut' Nacht" → "gut Nacht"
 * 4. Strip remaining non-word characters (punctuation, symbols)
 * 5. Lowercase
 */
function normalizePart(input: string): string {
    return input
        .trim()
        // .replace(/\s*\(.*?\)\s*/g, ' ')        // remove parenthetical subtitles
        .normalize('NFD')                        // decompose diacritics
        .replace(/[\u0300-\u036f]/g, '')         // strip combining characters
        .replace(/[''`]/g, '')                   // remove apostrophes
        .replaceAll(/\W/g, '')                   // strip remaining non-word chars
        .toLowerCase();
}
