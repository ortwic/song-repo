<script lang="ts">
    import { t } from 'svelte-i18n';
    import { scoreView, type ScoreViewState } from '../actions/score-view.action';

    interface Props {
        url?: string;
    }

    let { url }: Props = $props();
    let state = $state<ScoreViewState>('idle');
</script>

<div class="score-preview">
    {#if !url}
        <p class="text-muted">{$t('common.score-preview.no-score')}</p>
    {:else}
        {#if state === 'error'}
            <p class="text-muted">{$t('common.score-preview.score-error')}</p>
        {/if}
        <div class="score-container" use:scoreView={{ url, onStateChange: (s) => (state = s) }}></div>
    {/if}
</div>

<style lang="scss">
    .score-preview {
        min-height: 200px;
    }

    .score-container {
        width: 100%;
        overflow-x: auto;
    }

    .text-muted {
        color: var(--text-muted);
    }
</style>