import platformIcons from '../data/icons.json';

/**
 * Returns the Boxicons class name for a known platform.
 * Matches at the hostname level; ignores subdomains (unless explicitly listed).
 * Returns undefined if no platform is recognized.
 */
export function resolveIcon(url: string, fallback = 'bx-link'): string | undefined {
    let hostname: string;
    try {
        hostname = new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return fallback;
    }

    // Exact match first (e.g., “music.apple.com” before “apple.com”)
    if (hostname in platformIcons) {
        return platformIcons[hostname as keyof typeof platformIcons];
    }

    // Fallback: TLD and domain only (last two segments), e.g., “sub.youtube.com” → “youtube.com”
    const parts = hostname.split('.');
    if (parts.length > 2) {
        const base = parts.slice(-2).join('.');
        if (base in platformIcons) {
            return platformIcons[base as keyof typeof platformIcons];
        }
    }

    return fallback;
}