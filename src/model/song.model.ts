import type { Timestamp } from 'firebase/firestore';
import type { Percent, Status, TrainingAreas } from './types';

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
    masteryTargets: TrainingAreas<number>;
    notes: string;
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
    difficulty?: number;
    features?: string[];
    popularity?: {
        score?: number;
    };
}

export interface UserSong extends Song, ProgressModel {
    uid: string;
    source?: string; // should be notes
    notes?: string;
    createdAt?: Timestamp;
    changedAt?: Timestamp;
    learnedOn?: Date;
    fav?: boolean;
    tags?: string[];
}

export interface ProgressModel {
    status?: Status;
    progress?: Percent;
    touchCount?: number;
    lastRetention?: number;
    mastery?: TrainingAreas<Percent>;
}