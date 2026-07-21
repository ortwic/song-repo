<script lang="ts">
    import type { CalendarEvent } from "../model/event.model";

    interface Props {
        event: CalendarEvent;
    }

    let { event }: Props = $props();

    function fileName(path: string) {
        return path?.split('/').at(-1)?.split('.')[0];
    }
</script>

<div class="info">
    <img class="icon" src={event.place.icon} alt={fileName(event.place.icon)} />
    <h2>
        {#if event.organizer.displayName?.toLocaleLowerCase().indexOf('piano') > -1}
            🎹
        {:else}
            <i class="bx bx-globe"></i>
        {/if}
        <a href={event.website} target="_blank">{event.organizer.displayName}</a>
    </h2>
    <p>
        <i class="bx bx-map-pin"></i>
        <a href="https://www.google.de/maps/search/{event.place.formatted_address}" target="_blank">
            {event.place.formatted_address}
        </a>
    </p>
    <i class="bx bx-calendar"></i>
    {@html event.description.replace(/\n/g, '<br/>')}
</div>

<style lang="scss">
    :global(div[role="dialog"]) {
        color: var(--text) !important;
        background-color: var(--surface) !important;
    }

    :global(.gm-style .gm-style-iw-d) {
        scrollbar-color: var(--surface-mid) var(--surface);

        &::-webkit-scrollbar-track,
        &::-webkit-scrollbar-track-piece {
            background: var(--surface) !important;
        }

        &::-webkit-scrollbar-thumb {
            background: var(--surface-mid) !important;
        }
    }
 
    :global(.gm-style .gm-style-iw-tc::after) {
        background: var(--surface) !important;
    }
    
    .info {
        line-height: 1.5;

        .icon {
            position: absolute;
            top: 16px;
            right: 16px;
            z-index: -1;
            opacity: 0.3;
        }

        h2 {
            margin-top: 0;
        }

        p {
            margin: 0.4rem 0;
        }

        i.bx {
            color: var(--accent);
        }
    }
</style>
