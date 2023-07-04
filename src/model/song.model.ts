import type { Timestamp } from "firebase/firestore";
import type { Complete, Status } from "./types";

export interface Song {
    id: string;
    title: string;
    artist: string;
    album?: string;
    genre?: string;
    style?: string;
};

export interface UserSong extends Song {
    uid: string;
    status: Status;
    progress?: number;
    complete?: Complete;
    createdAt?: Timestamp;
    fav?: boolean;
    tags?: string[];
};
