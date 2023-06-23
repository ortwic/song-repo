import type { Complete, Status } from "./types";

export interface Song extends CustomItem {
    title: string;
    artist?: string;
    genre?: string;
};

export interface CustomItem {
    id: string;
    uid: string;
    status: Status;
    progress?: number;
    complete?: Complete;
    learnedOn?: Date;
    fav?: boolean;
    tags: string[];
};
