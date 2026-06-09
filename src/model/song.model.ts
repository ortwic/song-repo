import type { Timestamp } from 'firebase/firestore';
import type { Complete, Status } from './types';

export interface Artist {
    artistMbid: string;
    names: string[];
    genre?: string;
    style?: string;
    country?: string;
    countryCode?: string;
    formedYear?: number;
    gender?: string;
    memberCount?: number;
    label?: string;
    website?: string;
    thumb?: string;
    logo?: string;
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
    artistMbid?: string;
    source?: string;
    genre?: string;
    style?: string;
    mood?: string;
    key?: string;
    time?: string;
    bpm?: string | number;
    features?: string[];
    popularity?: {
        score?: number;
    };
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