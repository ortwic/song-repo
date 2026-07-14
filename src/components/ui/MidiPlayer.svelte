<script lang="ts">
    import { t } from 'svelte-i18n';

    // Own, UI-facing note shape, decoupled from whichever MIDI parser fills it.
    interface PianoRollNote {
        pitch: number;
        startSeconds: number;
        durationSeconds: number;
    }

    interface Props {
        midiUrl?: string;
        soundBankUrl?: string;
    }

    let { midiUrl, soundBankUrl }: Props = $props();
    let notes = $state<PianoRollNote[]>([]);
    let isPlaying = $state(false);

    // TODO: parse `midiUrl` with spessasynth_core's BasicMIDI and map its track/note
    // data into PianoRollNote[]. Track/note property names were not fully confirmed
    // from public sources at the time of writing - verify against
    // https://spessasus.github.io/spessasynth_core/ before implementing.
    async function loadNotes(url: string): Promise<void> {
        // Intentionally left unimplemented, see TODO above.
    }

    // TODO: wire playback via spessasynth_lib's WorkletSynthesizer. Confirmed minimal
    // usage from the library's own docs:
    //   const synth = new WorkletSynthesizer(audioContext);
    //   await synth.soundBankManager.addSoundBank(soundBankArrayBuffer, 'main');
    //   await synth.isReady;
    //   synth.noteOn(channel, key, velocity);
    // A soundBankUrl still needs to be provided by the caller (project soundfont).
    function togglePlayback(): void {
        isPlaying = !isPlaying;
    }
</script>

<div class="midi-player">
    <div class="piano-roll">
        {#if !notes.length}
            <p class="text-muted">{$t('common.midi-player.no-midi')}</p>
        {/if}
        <!-- TODO: render `notes` as a piano-roll grid once loadNotes() is implemented -->
    </div>
    <div class="playback-controls">
        <button class="clear" disabled={!midiUrl} title={$t('common.midi-player.play-midi')} onclick={togglePlayback}>
            <i class="item bx bx-play-circle"></i>
            {$t('common.midi-player.play-midi')}
        </button>
    </div>
</div>

<style lang="scss">
    .midi-player {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .piano-roll {
        min-height: 120px;
    }

    .playback-controls {
        display: flex;
        justify-content: flex-end;
    }

    .text-muted {
        color: var(--text-muted);
    }
</style>