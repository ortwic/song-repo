import type { Status } from "./types";

export interface DashboardSettings {
    limit: number;
    status: Record<Status, boolean>;
    fav: boolean | null;
}