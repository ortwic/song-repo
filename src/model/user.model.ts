import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
    id: string;
    name?: string;
    alias?: string;
    about?: string;
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
