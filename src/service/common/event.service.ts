import { map, startWith, type Observable } from 'rxjs';
import { DateTime } from 'luxon';
import { stores } from '../base/firestore.service';
import type { CalendarEvent, CalendarSettings, EventDate } from '../../model/event.model';
import { refData } from '../base/app-cache.setup';

export function getSettings(): CalendarSettings {
    return refData.settings.find((s) => s.id === 'google') || ({} as CalendarSettings);
}

export function getEvents(): Observable<CalendarEvent[]> {
    const date = (date: EventDate) => DateTime.fromJSDate(new Date(date.dateTime ?? date.date));
    return stores.events.getDocuments<CalendarEvent>().pipe(
        map((events) => {
            const today = DateTime.local();
            const futureDate = today.plus({ months: getSettings()?.futureMonths || 6 });
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
