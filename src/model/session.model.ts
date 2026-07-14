import type { Timestamp } from "firebase/firestore";
import type { SessionType, Status, TrainingAreas } from "./app.types";

export type Intensity = number;

export interface SongSession {
    type: SessionType;
    status?: Status;
    progress?: number;
    touchCount?: number;
    areas: TrainingAreas<Intensity>;
    tags?: string[];
    notes?: string;
}

export interface UserSession extends SongSession {
    id: string;
    title?: string;
    rel: 'song' | 'snippet';
    createdAt: Timestamp
    songId?: string;
    durationMinutes?: number;
}