import { Timestamp } from "firebase/firestore";
import { UserSong } from "./song.model";

export interface SongRequest {
    id: string;
    songId: string;
    status: 'open' | 'seen' | 'done';
    createdAt: Timestamp;
    changedAt?: Timestamp;
}

export interface SongRequestView extends SongRequest {
    song?: UserSong;
}

export interface SongRequestViewGroup {
    songId: string;
    song?: UserSong;
    count: number;
    latestCreatedAt: Timestamp;
    requestIds: string[];
}