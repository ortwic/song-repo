import { orderBy } from 'firebase/firestore';
import type { Observable } from 'rxjs';
import { DateTime } from 'luxon';
import FirestoreService from './firestore.service';
import type { CalendarEvent } from '../model/event.model';

const store = new FirestoreService('events');

export function getEvents(): Observable<CalendarEvent[]> {
    
    return store.getDocuments<CalendarEvent>(orderBy('created'));
}

export function formatRange(event: CalendarEvent) {
    const start = DateTime.fromJSDate(new Date(event.start.dateTime));
    const end = DateTime.fromJSDate(new Date(event.end.dateTime));
    if (start.month === end.month) {
        return `${start.toFormat('MMM d')} - ${end.toFormat('d')}`;
    } else {
        return `${start.toFormat('MMM d')} - ${end.toFormat('MMM d')}`;
    }
}