import { Timestamp } from "firebase/firestore";
import { ObjectValues } from "./app.types";

const SNIPPET_TYPE_RECORD = {
    custom: 'custom', // User-defined snippet that does not fit a predefined category

    // Learning and practice
    etude: 'etude', // Technical study or exercise piece for practicing specific skills

    // Musical ideas and phrases
    motif: 'motif', // Short musical idea that can be developed or repeated
    phrase: 'phrase', // Complete musical statement made of one or more motifs

    // Characteristic short ideas
    riff: 'riff', // Repeating melodic or rhythmic figure, often driving a section
    lick: 'lick', // Short, characteristic musical phrase, often used in improvisation

    // Rhythmic material
    groove: 'groove', // Rhythmic pattern that establishes the feel or pulse
    pattern: 'pattern', // Generic repeating sequence of notes, rhythms, or movements

    // Structural elements
    fill: 'fill', // Brief transitional passage connecting musical sections
    progression: 'progression', // Sequence of chords forming a harmonic structure
    cadence: 'cadence' // Harmonic progression that creates a sense of resolution or pause
} as const;

export const SNIPPET_KEYS = Object.keys(SNIPPET_TYPE_RECORD) as SnippetType[];
export type SnippetType = ObjectValues<typeof SNIPPET_TYPE_RECORD>;

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
    description_en?: string;
    description_de?: string;
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