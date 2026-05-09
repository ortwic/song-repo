export interface ParsedSearchQuery {
    title: string;
    artist?: string;
}

export function parseSearchQuery(raw: string, delimiter = ' - '): ParsedSearchQuery {
    const parts = raw.trim().split(delimiter, 2);
    const title = parts[0].trim();
    const artist = parts[1]?.trim() || undefined;

    return artist ? { title, artist } : { title };
}