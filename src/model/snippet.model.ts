import { Timestamp } from "firebase/firestore";

export type SnippetType =  'custom' | 'etude' | 'motif' | 'riff';

export interface Snippet {
    id: string;
    type: SnippetType;
    title: string;
    artist: string;
    groups?: string[];
    source?: string;
    instruments?: string[];
    uri?: string;
    midiPath?: string;
    mxmlPath?: string;
    difficulty?: number;
    key?: string;
    bpm?: number;
    time?: string;
    tags: [];
    createdAt: Timestamp;
}

export interface UserSnippet extends Snippet {
    fav?: boolean;
    uid: string;
    changedAt: Timestamp;
    touchCount?: number;
    snippetId: string;
}