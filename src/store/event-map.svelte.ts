import type { Loader, LoaderOptions } from "@googlemaps/js-api-loader";
import type { CalendarEvent } from "../model/event.model";
import { wrapAsyncAction } from "../utils/promise.helper";
import { showError } from "./notification.store";

const options: LoaderOptions = {
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, 
    version: 'weekly', 
    libraries: ["places"] 
};
const dachViewport = { 
    mapId: 'song-repo-map', 
    center: { lat: 51.5074, lng: 10.1481 }, 
    zoom: 6 
};

type EventMarkerParams = {
    onShowInfo: (target: HTMLElement, event: CalendarEvent) => void;
    events: CalendarEvent[];
    id?: string;
};

export const eventMap = wrapAsyncAction<HTMLDivElement, EventMarkerParams>(createEventMap);

async function createEventMap(node: HTMLDivElement, params: EventMarkerParams) {
    let latestEvents: CalendarEvent[] = [];

    async function tryCreateMap(loader: Loader) {
        try {
            const { Map } = await loader.importLibrary('maps');
            dachViewport['colorScheme'] = google.maps.ColorScheme.FOLLOW_SYSTEM;
            return new Map(node, dachViewport);
        } catch (error) {
            showError(error);
        }
    }

    async function updateMarkers(loader: Loader, map: google.maps.Map, events: CalendarEvent[]) {
        if (!events.length) {
            return [];
        }

        const { AdvancedMarkerElement, PinElement } = await loader.importLibrary('marker');

        try {
            let index = events.length;
            const createMarker = (event: CalendarEvent) => {
                // https://developers.google.com/maps/documentation/javascript/advanced-markers/accessible-markers
                if (event.place?.geometry) {
                    const pin = new PinElement({ 
                        glyphText: `${index--}`,
                        glyphColor: 'white',
                        background: event.place.icon_background_color,
                        borderColor: '#606060',
                    });
                    const position = event.place.geometry.location;
                    const title = event.place.formatted_address;
                    const marker = new AdvancedMarkerElement({ map, position, title, content: pin.element });
                    marker.addListener('click', () => showInfoWindow(map, event));
                    return marker;
                }
            };

            events.toReversed().map(e => createMarker(e));
        } catch (error) {
            showError(error);
        }
        return events;
    }

    function zoomToEvent(map: google.maps.Map, id: string) {
        const event = latestEvents.find(e => e.id === id);
        if (event) {
            if (event.place?.geometry) {
                centerViewport(map, event);
                showInfoWindow(map, event);
            } else {
                showError(event.place.name);
            }
        } else {
            centerViewport(map);
            showInfoWindow(map);
        }
    }

    function centerViewport(map: google.maps.Map, event?: CalendarEvent) {
        map.setOptions(event ? {
            mapId: dachViewport.mapId,
            center: { 
                lat: event.place.geometry.location.lat, 
                lng: event.place.geometry.location.lng
            },
            zoom: 12
        } : dachViewport);
    }

    function showInfoWindow(map: google.maps.Map, event?: CalendarEvent) {
        currentInfo?.close();
        if (event) {
            params.onShowInfo(infoWindowElement, event);
            currentInfo = new google.maps.InfoWindow({
                position: event.place.geometry?.location,
                pixelOffset: new google.maps.Size(0, -40),
                content: infoWindowElement
            });
            currentInfo.open(map);
        } 
    }

    let currentInfo: google.maps.InfoWindow;
    const infoWindowElement = document.createElement('div');
    
    const { Loader } = await import('@googlemaps/js-api-loader');
    const loader = new Loader(options);
    const map = await tryCreateMap(loader);

    latestEvents = await updateMarkers(loader, map, params.events);

    zoomToEvent(map, params.id);

    return {
        update({ events, id }: Partial<EventMarkerParams>) {
            if (events !== undefined) {
                updateMarkers(loader, map, events)
                    .then(items => latestEvents = items);
            }
            if (id !== undefined) {
                zoomToEvent(map, id);
            }
        }
    };
}