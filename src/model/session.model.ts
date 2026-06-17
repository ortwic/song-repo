import type { Timestamp } from "firebase/firestore";
import type { SessionType, Status, TrainingAreas } from "./types";

export type Intensity = number;

export interface SongDiff {
    status?: Status;
    progress?: number;
    areas: TrainingAreas<Intensity>;
    tags?: string[];
    notes?: string;
}

export interface UserSession extends SongDiff {
    id: string;
    type: SessionType;
    title?: string;
    createdAt: Timestamp
    songId?: string;
    durationMinutes?: number;
}