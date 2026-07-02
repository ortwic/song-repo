<script lang="ts">
    import { t } from "svelte-i18n";
    import type { Metronome } from "@dougflip/metronome";

    interface Props {
        mute?: boolean;
        min?: number;
        max?: number;
        volume?: number;
        metronome: Metronome;
    };

    let { 
        mute = $bindable(true),
        min = 40,
        max = 256,
        volume = $bindable(50), 
        metronome = $bindable(null)
    }: Props = $props();

    const config = metronome.getState();

    let tempo = $state(config.tempo);
    mute = config.playbackState !== 'playing';
    volume = config.volume;

    $effect(() => {
        metronome.updateConfig({ tempo, volume });
    });

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