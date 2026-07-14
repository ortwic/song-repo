<script lang="ts">
    import { t } from 'svelte-i18n';
    import { scoreView, type ScoreViewOptions, type ScoreViewState } from '../actions/score-view.action';

    type Props = Omit<ScoreViewOptions, 'onStateChange'> & {
        height?: string;
    };

    let {
        url,
        height = 'auto',
        firstInstrumentOnly,
        measureCount,
        drawCredits,
        drawTitle,
        drawPartNames,
        zoom = 1,
    }: Props = $props();
    let state = $state<ScoreViewState>('idle');
</script>

<div class="score-preview">
    {#if !url}
        <p class="text-muted">{$t('common.score-preview.no-score')}</p>
    {:else if state === 'error'}
        <p class="text-muted">{$t('common.score-preview.score-error')}</p>
    {:else}
        <div
            class="score-container"
            style:height="{height}"
            use:scoreView={{
                url,
                firstInstrumentOnly,
                measureCount,
                zoom,
                drawCredits,
                drawTitle,
                drawPartNames,
                onStateChange: (s) => (state = s),
            }}
        ></div>
    {/if}
</div>

<style lang="scss">
    .score-preview {
        width: 100%;
    }

    .score-container {
        width: 100%;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: flex-start;
    }

    .text-muted {
        color: var(--text-muted);
    }
</style>
