export interface CalendarEvent {
    id: string;
    summary: string;
    description: string;
    location: string;
    created: string;
    creator: EventContact;
    organizer: EventContact;
    start: EventDate;
    end: EventDate;
    place?: EventPlace;
    website?: string;
}

interface EventContact {
    id?: string;
    displayName: string;
    email: string;
    self?: boolean;
}

export interface EventDate {
    date?: string;
    dateTime?: string;
    timeZone?: string;
}

interface EventPlace {
    place_id: string;
    name: string;
    formatted_address: string;
    geometry: {
        location: google.maps.LatLngLiteral;
        viewport: {
            northeast: google.maps.LatLngLiteral;
            southwest: google.maps.LatLngLiteral;
        }
    };
    icon: string; // image url
    icon_background_color: string;
    url: string;
    website: string;
}
