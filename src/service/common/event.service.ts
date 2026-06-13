import { DateTime } from 'luxon';
import { map, startWith, type Observable } from 'rxjs';
import { stores } from '../base/firestore.service';
import type { CalendarEvent, EventDate } from '../../model/event.model';

const today = DateTime.local();
const next6Month = today.plus({ months: 6 });

export function getEvents(): Observable<CalendarEvent[]> {
    const date = (date: EventDate) => DateTime.fromJSDate(new Date(date.dateTime ?? date.date));
    return stores.events.getDocuments<CalendarEvent>().pipe(
        map((events) => {
            return events
                .filter((event) => date(event.end) >= today && date(event.end) <= next6Month)
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
