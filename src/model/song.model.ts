import type { Timestamp } from 'firebase/firestore';
import type { Percent, Status } from './types';

export interface Artist {
    id: string;
    names: string[];
    artistMbid: string;
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
    album?: string;
    year?: string;
    uri?: string;
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
    progress?: Percent;
    progressLogs?: Percent[]; // unused
    source?: string; // should be notes
    notes?: string;
    difficulty?: number;
    createdAt?: Timestamp;
    changedAt?: Timestamp;
    learnedOn?: Date;
    fav?: boolean;
    tags?: string[];
}