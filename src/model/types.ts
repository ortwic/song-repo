type ObjectValues<T> = T[keyof T];

const STATUS_RECORD = {
    todo: 'todo',
    wip: 'wip',
    done: 'done',
    repeat: 'repeat',
    archived: 'archived'
} as const;

export const STATUS_KEYS = Object.values(STATUS_RECORD);

export type Percent = number;
export type Status = ObjectValues<typeof STATUS_RECORD>;

export type MenuTarget = 'hidden' | 'dynamic' | 'signup';

export type SearchEngines = 'musicbrainz' | 'audius' | 'discogs' | 'songbpm';
