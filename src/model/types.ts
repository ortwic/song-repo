export enum Complete {
    Melody = 0b0000000000000000000000000000001,
    Rythm = 0b0000000000000000000000000000010,
    Harmony = 0b0000000000000000000000000000100,
    Structure = 0b0000000000000000000000000001000,
    Memorized = 0b0000000000000000000000000010000,
    Finishing = 0b0000000000000000000000000100000,
}

export type Status =
    | 'unknown'
    | 'todo'
    | 'wip'
    | 'done'
    | 'repeat'
    | 'archived';

export type MenuPages = 'self' | 'root' | 'login' | 'signup';
