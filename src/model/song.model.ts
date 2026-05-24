import type { Timestamp } from 'firebase/firestore';
import type { Complete, Status } from './types';

export interface Artist {
    id: string;
    name: string;
    uri?: string;
    img?: string;
    country?: string;
}

export interface Genre {
    id: string;
    name: string;
    color: string;
    styles: string[];
}

export interface Song {
    id: string;
    title: string;
    artist: string;
    artistImg?: string;
    source?: string;
    genre?: string;
    style?: string;
    key?: string;
    time?: string;
    bpm?: string | number;
    features?: string[];
}

export interface UserSong extends Song {
    uid: string;
    status: Status;
    statusLogs?: Status[]; // unused
    progress?: number;
    progressLogs?: number[]; // unused
    uri?: string;
    notes?: string;
    difficulty?: number;
    complete?: Complete; // unused
    createdAt?: Timestamp;
    changedAt?: Timestamp;
    learnedOn?: Date;
    fav?: boolean;
    tags?: string[];
}