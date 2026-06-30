type ObjectValues<T> = T[keyof T];

const STATUS_RECORD = {
    1: 'todo',
    2: 'wip',
    3: 'done',
    4: 'repeat',
    5: 'archived'
} as const;

const FOCUS_RECORD = {
    1: 'melody',
    2: 'rhythm',
    3: 'harmony',
    4: 'form',
    5: 'technique',
    6: 'memorize',
    7: 'expression',
    8: 'improv',
    9: 'finishing'
} as const;

const SESSIONKIND_RECORD = {
    1: 'practice',
    2: 'jam',
    3: 'demo',
    4: 'record',
    5: 'import'
} as const;

const AUTO_STATUS = 'auto' as const;
export const STATUS_KEYS = Object.values(STATUS_RECORD);
export const STATUS_MODES = [AUTO_STATUS, ...STATUS_KEYS] as const;
export const FOCUS_KEYS = Object.values(FOCUS_RECORD);
export const SESSIONKIND_KEYS = Object.values(SESSIONKIND_RECORD);

export type Percent = number;
export type Status = ObjectValues<typeof STATUS_RECORD>;
export type StatusMode = typeof AUTO_STATUS | Status;
export type TrainingAreas<T> = Partial<Record<TrainingFocus, T>>;
export type TrainingFocus = ObjectValues<typeof FOCUS_RECORD>;

export type SessionType = SessionKind | 'free' | 'quick';
export type SessionKind = ObjectValues<typeof SESSIONKIND_RECORD>;

export type MenuTarget = 'hidden' | 'dynamic' | 'signup';

export type SearchEngines = 'musicbrainz' | 'audius' | 'discogs' | 'songbpm';
