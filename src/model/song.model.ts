import type { Complete, Status } from "./types";

export interface Song {
    id: string;
    title: string;
    artist: string;
    album?: string;
    genre?: string;
    styles?: string[];
};

export interface UserSong extends Song {
    uid: string;
    status: Status;
    progress?: number;
    complete?: Complete;
    learnedOn?: Date;
    fav?: boolean;
    tags?: string[];
};
