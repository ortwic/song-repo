<script lang="ts">
    import NavButton from "../ui/elements/NavButton.svelte";
    import { formatRange, getEvents } from "../../service/event.service";
    
    const events = getEvents();
</script>

<section class="menu">
    {#each $events as event}
    <div class="row">
        <NavButton href="/events/{event.id}">
            <strong>{formatRange(event)}</strong> –
            {event.organizer.displayName}
            <br/>
            <span>
                🎹 {event.location.split('–')[0]}
            </span>
        </NavButton>
    </div>
    {/each}
</section>

<style lang="scss">
    .event {
        width: calc(100% - 1em);
        white-space: nowrap;
    }
</style>