import type { Timestamp } from "firebase/firestore";
import type { SessionType, Status, TrainingAreas } from "./types";

export type Intensity = number;

export interface SessionRecord {
    type: SessionType;
    status?: Status;
    progress?: number;
    touchCount?: number;
    areas: TrainingAreas<Intensity>;
    tags?: string[];
    notes?: string;
}

export interface UserSession extends SessionRecord {
    id: string;
    title?: string;
    createdAt: Timestamp
    songId?: string;
    durationMinutes?: number;
}