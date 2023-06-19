import type { Complete, Status } from "./types";

export interface Song extends Item {
    artist?: string;
    genre?: string;
    complete?: Complete;
    learnedOn?: Date;
    fav?: boolean;
    tags: string[];
};

export interface Item {
    uid: string;
    title: string;
    status: Status;
    progress?: number;
};
