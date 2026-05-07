import { Timestamp } from 'firebase/firestore';
import { DashboardSettings } from './song.model';

export interface UserProfile {
    id: string;
    name?: string;
    email?: string;
    provider?: string;
    photoURL?: string;
    alias?: string;
    about?: string;
    settings?: {
        dashboard?: DashboardSettings;
    }
    created: Date;
    deleted?: Date;
}

export interface UserLink {
    id: string;
    title: string;
    url: string;
    createdAt: Timestamp;
    changedAt: Timestamp;
    icon?: string;
    order?: number;
}
