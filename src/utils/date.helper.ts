import { Timestamp } from "firebase/firestore";
import { DateTime } from "luxon";

export type DateLike = object | Date | Timestamp | string | undefined;

export const truncateTime = (date: DateLike, precisionMinutes = 5) => 
    date ? Math.floor(toJSDate(date).getTime() / (precisionMinutes * 60_000)) : 0;

export function toDate(value: DateLike): DateTime {
    return DateTime.fromJSDate(toJSDate(value));
}

function toJSDate(value: DateLike): Date {
    if (value !== undefined) {
        if (typeof value === 'string') {
            return new Date(value);
        }
        if (value instanceof Date) {
            return value;
        }
        const ts = value as Timestamp;
        if ('toDate' in ts && ts.toDate instanceof Function) {
            return ts.toDate();
        }
        if ('seconds' in ts && ts.seconds) {
            return DateTime.fromSeconds(ts.seconds).toJSDate();
        }
    }
    return new Date(0);
}
