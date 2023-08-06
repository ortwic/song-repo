import type { Timestamp } from 'firebase/firestore';
import type { Complete, Status } from './types';

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
    progress?: number;
    progressLogs?: number[];
    difficulty?: number;
    complete?: Complete;
    createdAt?: Timestamp;
    changedAt?: Timestamp;
    learnedOn?: Date;
    fav?: boolean;
    tags?: string[];
}
