import { Timestamp } from "firebase/firestore";

export type SnippetType =
    | 'custom'      // User-defined snippet that does not fit a predefined category

    // Learning and practice
    | 'etude'       // Technical study or exercise piece for practicing specific skills

    // Musical ideas and phrases
    | 'motif'       // Short musical idea that can be developed or repeated
    | 'phrase'      // Complete musical statement made of one or more motifs

     // Characteristic short ideas
    | 'riff'        // Repeating melodic or rhythmic figure, often driving a section
    | 'lick'        // Short, characteristic musical phrase, often used in improvisation

    // Rhythmic material
    | 'groove'      // Rhythmic pattern that establishes the feel or pulse
    | 'pattern'     // Generic repeating sequence of notes, rhythms, or movements

    // Structural elements
    | 'fill'        // Brief transitional passage connecting musical sections
    | 'progression' // Sequence of chords forming a harmonic structure
    | 'cadence';    // Harmonic progression that creates a sense of resolution or pause

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