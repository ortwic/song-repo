import { Timestamp } from 'firebase/firestore';
import type { UserSettings } from './settings.model';

export interface UserProfile {
    id: string;
    name?: string;
    email?: string;
    provider?: string;
    photoURL?: string;
    alias?: string;
    about?: string;
    settings?: UserSettings;
    created: Date;
    deleted?: Date;
}

export interface UserProfileView extends UserProfile {
    links: UserLink[];
}

export type LinkPlacement = 'default' | 'donation';

export interface UserLink {
    id: string;
    title: string;
    url: string;
    createdAt: Timestamp;
    changedAt: Timestamp;
    placement: LinkPlacement[];
    icon?: string;
    order?: number;
}
