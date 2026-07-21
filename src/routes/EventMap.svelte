<script lang="ts">
    import { t } from "svelte-i18n";
    import { mount, unmount } from "svelte";
    import TitlebarMenu from "../components/menus/TitlebarMenu.svelte";
    import type { CalendarEvent } from "../model/event.model";
    import { getEvents } from "../service/common/event.service";
    import { menu } from "../store/menu-context.svelte";
    import { eventMap } from "../store/event-map.svelte";
    import EventMapInfoBubble from "./EventMapInfoBubble.svelte";

    interface Props {
        routeParams?: { id?: string };
    }

    let { 
        routeParams = {}
    }: Props = $props();

    const events$ = getEvents();
    let infoComponent: ReturnType<typeof mount>;

    function onShowInfo(target: HTMLElement, event: CalendarEvent): void {
        if (infoComponent) {
            unmount(infoComponent);
        }

        infoComponent = mount(EventMapInfoBubble, {
            target,
            props: { event }
        });
    }
</script>

<svelte:head>
   <title>{ $t('calendar.title') } | {import.meta.env.PACKAGE_NAME}</title>
</svelte:head>

<main use:menu.offset>
    <TitlebarMenu>
        <i class="bx bx-calendar"></i>&nbsp; {$t('menu.events')}
    </TitlebarMenu>
    <div class="full" use:eventMap={{ 
        onShowInfo, 
        events: $events$, 
        id: routeParams?.id ?? null 
    }}>
    </div>
</main>

<style lang="scss">
    .full {
        border: 0;
        width: 100%;
        height: calc(100% - 2.2em);
    }
</style>