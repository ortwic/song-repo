<script lang="ts">
    import { onMount } from "svelte";
    import { params as params$ } from "svelte-spa-router";
    import { t } from "svelte-i18n";
    import { Loader } from '@googlemaps/js-api-loader';
    import { getEvents, getSettings } from "../service/event.service";
    import { showError } from "../store/notification.store";
    import type { CalendarEvent } from "../model/event.model";

    let mapContainer: HTMLDivElement;
    let infoContents: Record<string, HTMLDivElement> = {};
    let currentInfo: google.maps.InfoWindow;

    const mapId = 'song-repo-map';
    const events = getEvents();

    async function initMap(container: HTMLElement, events: CalendarEvent[]) {
        let index = events.length;
        const dachViewport = { 
            mapId, 
            center: { lat: 51.5074, lng: 10.1481 }, 
            zoom: 6 
        };

        try {
            const loader = await createLoader();
            const { AdvancedMarkerElement, PinElement } = await loader.importLibrary('marker');
            const { Map } = await loader.importLibrary('maps');
            const map = new Map(container, dachViewport);
            const createMarker = (event: CalendarEvent) => {
                // https://developers.google.com/maps/documentation/javascript/advanced-markers/accessible-markers
                if (event.place?.geometry) {
                    const pin = new PinElement({ 
                        glyph: `${--index}`,
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
            return map;
        } catch (error) {
            showError(error);
        }
    }

    async function createLoader() {
        const { maps: apiKey, version } = await getSettings();
        return new Loader({ apiKey, version, libraries: ["places"] });
    }

    function centerViewport(map: google.maps.Map, event?: CalendarEvent) {
        map.setOptions({
            mapId,
            center: { 
                lat: event.place.geometry.location.lat, 
                lng: event.place.geometry.location.lng
            },
            zoom: 12
        });
    }

    function showInfoWindow(map: google.maps.Map, event: CalendarEvent) {   
        currentInfo?.close();
        currentInfo = new google.maps.InfoWindow({
            position: event.place.geometry.location,
            pixelOffset: new google.maps.Size(0, -40),
            content: infoContents[event.id]
        });
        currentInfo.open(map);     
    }

    function fileName(path: string) {
        return path?.split('/').at(-1)?.split('.')[0];
    }

    onMount(async () => {
        getEvents().subscribe(async (events) => {
            if (mapContainer) {
                const map = await initMap(mapContainer, events);
                params$.subscribe((p) => {
                    const event = events.find(e => e.id === p?.id);
                    if (event) {
                        centerViewport(map, event);
                        showInfoWindow(map, event);
                    }
                });                
            }
        });
    });

</script>

<svelte:head>
   <title>{ $t('calendar.title') } | Song Repertory</title>
</svelte:head>

<main>
    <div class="full" bind:this={mapContainer}></div>
    <div class="template">
        {#each $events as event}
            <div class="info" bind:this={infoContents[event.id]}>
                <img class="icon" src="{event.place.icon}" alt="{fileName(event.place.icon)}" />
                <p>
                    <i class='bx bx-globe'></i> 
                    <a href="{event.website}" target="_blank">{event.organizer.displayName}</a>
                </p>
                <p>
                    <i class='bx bx-map-pin'></i> 
                    <a href="https://www.google.de/maps/search/{event.place.formatted_address}" target="_blank">
                        {event.place.formatted_address}
                    </a>
                </p>
                <i class='bx bx-calendar'></i> {@html event.description.replace(/\n/g, '<br/>')}
            </div>
        {/each}
    </div>
</main>

<style lang="scss">
    .full {
        border: 0;
        width: 100%;
        height: 100%;
    }

    .template {
        display: none;
    }

    .info {
        line-height: 1.5;

        .icon {
            position: absolute;
            top: 16px;
            right: 16px;
            z-index: -1;
            opacity: .3;
        }

        p {
            margin: .4rem 0;
        }
        
        i.bx {
            color: var(--primary);
        }
    }
</style>