import { combineLatest, map, startWith, type Observable } from 'rxjs';
import { DateTime } from 'luxon';
import FirestoreService from './firestore.service';
import type { CalendarEvent, EventDate } from '../model/event.model';

const store = new FirestoreService('events');
const settings = new FirestoreService('settings').getDocument<Settings>('google');

type Settings = {
    maps: string;
    version: 'weekly' | 'quarterly';
    futureMonths: number;
};

export async function getSettings(): Promise<Settings> {
    return await settings;
}

export function getEvents(): Observable<CalendarEvent[]> {
    const date = (date: EventDate) => DateTime.fromJSDate(new Date(date.dateTime ?? date.date));
    return combineLatest([settings, store.getDocumentStream<CalendarEvent>()]).pipe(
        map(([settings, events]) => {
            const today = DateTime.local();
            const futureDate = today.plus({ months: settings.futureMonths });
            return events
                .filter((event) => {
                    const eventEnd = date(event.end);
                    return eventEnd >= today && eventEnd <= futureDate;
                })
                .sort((a, b) => date(a.end).toMillis() - date(b.end).toMillis());
        }),
        startWith([])
    );
}

export function formatRange(event: CalendarEvent) {
    const start = parseDate(event.start);
    const end = parseDate(event.end);
    if (start.month === end.month) {
        if (start.day === end.day) {
            return `${start.toFormat('MMM d')}`;
        }
        return `${start.toFormat('MMM d')} - ${end.toFormat('d')}`;
    } else {
        return `${start.toFormat('MMM d')} - ${end.toFormat('MMM d')}`;
    }
}

function parseDate(date: EventDate) {
    return DateTime.fromJSDate(new Date(date.dateTime ?? date.date));
}
