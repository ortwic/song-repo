import Color from "color";
import { generateColorCode } from "../styles/style.helper";

export function generateAvatarUrl(name: string, seed?: string): string {
    const baseColor = Color(generateColorCode(seed || name));
    const fromColor = baseColor.lighten(0.4).hex();
    const toColor = baseColor.darken(0.2).hex();
    const textColor = baseColor.isDark() ? 'white' : 'black';
    const initials = getInitials(name);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192"><defs><linearGradient id="grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${fromColor}"/><stop offset="100%" stop-color="${toColor}"/></linearGradient></defs><rect width="192" height="192" rx="96" fill="url(#grad)"/><text x="96" y="118" font-family="Helvetica, Arial, sans-serif" font-size="72" font-weight="700" fill="${textColor}" text-anchor="middle">${initials}</text></svg>`;

    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}