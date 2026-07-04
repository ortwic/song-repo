<script lang="ts">
    import { onMount } from "svelte";
    import { t } from "svelte-i18n";
    import { createMetronome, parseTempo, type Metronome } from "../../../utils/metronome/metronome-adapter";
    import PopupMenu from "../PopupMenu.svelte";

    interface Props {
        mute?: boolean;
        time?: string;
        bpm?: number | string;
        volume?: number;
        limitRange?: boolean;
    };

    let { 
        mute = $bindable(true),
        time = "4/4",
        bpm = 120,
        limitRange = $bindable(),
        volume = $bindable(50), 
    }: Props = $props();

    let tempo = $derived(parseTempo(bpm));
    let max = $derived(limitRange ? tempo : 256);
    let min = $derived(limitRange ? tempo * .5 : 40);
    let metronome: Metronome = $state(null);
    let metronomePopupMenu = $state<PopupMenu>();

    onMount(() => {
        metronome = createMetronome(time, {
            tempo,
            volume
        });
        return metronome.destroy;
    });

    $effect(() => {
        metronome.updateConfig({ tempo, volume });
    });

    function start(e: MouseEvent): void {
        metronome.start();
        metronomePopupMenu?.showPopupMenu(e);
    }

    function togglePlay() {
        mute = !mute;
        if (!mute) {
            metronome.start();
        } else {
            metronome.pause();
        }
    }

    function toggleMute() {
        mute = !mute;
        if (!mute) {
            metronome.resume();
        } else {
            metronome.pause();
        }
    }

    function volumeIcon() {
        if (volume === 0) {
            return 'bx-volume-mute';
        } 
        if (volume < 30) {
            return 'bx-volume';
        }
        if (volume < 70) {
            return 'bx-volume-low';
        }
        return 'bx-volume-full';
    }

</script>

<button title={$t('sessions.menu.metronome')} class="clear" 
    onclick={start}>
    <i class="item bx metronome"></i>
</button>

<PopupMenu bind:this={metronomePopupMenu}>
    <div class="metronom-body">
        <button class="clear" title="{$t('sessions.metronome.mute')}" onclick={togglePlay}>
            <i class="item bx {mute ? 'bx-play' : 'bx-pause'}"></i>
        </button>
        <div class="block">
            <input class="metronom-slider" bind:value={tempo} type="range" {min} {max} step="1">
        </div>
        <div class="block">{tempo} bpm</div>
        <button class="clear" title="{$t('sessions.metronome.mute')}" onclick={toggleMute}>
            <i class="item bx {volumeIcon()}"></i>
        </button>
        <div class="block">
            <input class="metronom-slider" bind:value={volume} type="range" min="0" max="100" step="1">
        </div>
        <div class="block">{volume} %</div>
    </div>
</PopupMenu>

<style lang="scss">
    .metronom-slider {
        padding: 0.5em 0;
    }

    .metronom-body {
        display: grid;
        grid-template-columns: auto 1fr 5rem;
        gap: .4rem;
    }

    .block {
        display: flex;
        align-items: center;
        justify-content: center;
    }

</style>