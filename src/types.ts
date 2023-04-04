export enum Complete {
    Melody =    0b0000000000000000000000000000001,
    Rythm =     0b0000000000000000000000000000010,
    Harmony =   0b0000000000000000000000000000100,
    Structure = 0b0000000000000000000000000001000,
    Memorized = 0b0000000000000000000000000010000,
    Finishing = 0b0000000000000000000000000100000,
};

export enum Status {
    Unknown,
    Todo, 
    Wip, 
    Done, 
    Repeat
};

export interface Song extends Item {
    title: string;
    artist?: string;
    genre?: string;
    complete?: Complete;
    learnedOn?: Date;
    tags: string[];
};

export interface Item {
    id: string;
    status: Status;
    progress?: number;
};
