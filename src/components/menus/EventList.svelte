<script lang="ts">
    import { t } from "svelte-i18n";
    import NavButton from "../ui/elements/NavButton.svelte";
    import { formatRange, getEvents } from "../../service/event.service";
    
    const events = getEvents();
</script>

<section class="menu">
    {#if !$events.length}
        <div><i>{ $t('menu.events-empty') }</i></div>
    {/if}
    {#each $events as event}
    <div class="row">
        <NavButton href="/events/{event.id}">
            <strong>{formatRange(event)}</strong>
            <span>
                {event.organizer.displayName}
            </span>
            <br/>
            <i class='bx bx-map-pin'></i> {event.location.split('–')[0]}
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