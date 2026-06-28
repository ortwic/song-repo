<script lang="ts">
    import { t } from 'svelte-i18n';
    import Switch from '../ui/elements/Switch.svelte';
    import { settings, saveSettings } from '../../store/user-settings.svelte';
    import SongService from '../../service/user/user-song.service';
    import { createSongEntity } from '../../domain/song.entity';
    import { showInfo } from '../../store/notification.store';
    import { firstValueFrom } from 'rxjs';

    function updateSettings() {
        saveSettings('advanced', settings.advanced);
    }

    function updateNumber(key: keyof typeof settings.advanced, e: Event & { currentTarget: HTMLInputElement }) {
        if (!Number.isNaN(e.currentTarget.valueAsNumber)) {
            settings.advanced = { ...settings.advanced, [key]: e.currentTarget.valueAsNumber };
            updateSettings();
        }
    }

    function toggleEditProgressManually(value: unknown) {
        settings.advanced.editProgressManually = value as boolean;
        updateSettings();
    }

    async function migrateLegacyProgress() {
        const service = new SongService();
        const songs = await firstValueFrom(service.usersongs$);
        await Promise.all(songs
            .map(song => createSongEntity(song, settings.advanced).migrateLegacyProgress())
            .filter(Boolean)
            .map(song => service.setSong(song))
        );
        showInfo('✔ ' + $t('settings.advanced.migrate-button'));
    }
</script>

<div class="section grid-max-2">
    <label for="quick-session-delta-per-area">{$t('settings.advanced.quick-session-delta-per-area')}</label>
    <input
        id="quick-session-delta-per-area"
        class="input number"
        type="number"
        min="0"
        max="10"
        step="1"
        value={settings.advanced.quickSessionDeltaPerArea}
        onchange={(e) => updateNumber('quickSessionDeltaPerArea', e)}
    />

    <label for="quick-session-duration-minutes">{$t('settings.advanced.quick-session-duration-minutes')}</label>
    <input
        id="quick-session-duration-minutes"
        class="input number"
        type="number"
        min="1"
        max="120"
        step="1"
        value={settings.advanced.quickSessionDurationMinutes}
        onchange={(e) => updateNumber('quickSessionDurationMinutes', e)}
    />

    <label for="progress-archived-threshold">{$t('settings.advanced.progress-archived-threshold')}</label>
    <input
        id="progress-archived-threshold"
        class="input number"
        type="number"
        min="0"
        max="100"
        step="1"
        value={settings.advanced.progressArchivedThreshold}
        onchange={(e) => updateNumber('progressArchivedThreshold', e)}
    />

    <label for="progress-done-threshold">{$t('settings.advanced.progress-done-threshold')}</label>
    <input
        id="progress-done-threshold"
        class="input number"
        type="number"
        min="0"
        max="100"
        step="1"
        value={settings.advanced.progressDoneThreshold}
        onchange={(e) => updateNumber('progressDoneThreshold', e)}
    />

    <label for="progress-repeat-threshold">{$t('settings.advanced.progress-repeat-threshold')}</label>
    <input
        id="progress-repeat-threshold"
        class="input number"
        type="number"
        min="0"
        max="100"
        step="1"
        value={settings.advanced.progressRepeatThreshold}
        onchange={(e) => updateNumber('progressRepeatThreshold', e)}
    />

    <label for="retention-half-life-days">{$t('settings.advanced.retention-half-life-days')}</label>
    <input
        id="retention-half-life-days"
        class="input number"
        type="number"
        min="1"
        max="365"
        step="1"
        value={settings.advanced.retentionHalfLifeDays}
        onchange={(e) => updateNumber('retentionHalfLifeDays', e)}
    />

    <label for="retention-session-boost-factor">{$t('settings.advanced.retention-session-boost-factor')}</label>
    <input
        id="retention-session-boost-factor"
        class="input number"
        type="number"
        min="0"
        max="1"
        step="0.05"
        value={settings.advanced.retentionSessionBoostFactor}
        onchange={(e) => updateNumber('retentionSessionBoostFactor', e)}
    />

    <label for="retention-grace-period-days">{$t('settings.advanced.retention-grace-period-days')}</label>
    <input
        id="retention-grace-period-days"
        class="input number"
        type="number"
        min="0"
        max="30"
        step="1"
        value={settings.advanced.retentionGracePeriodDays}
        onchange={(e) => updateNumber('retentionGracePeriodDays', e)}
    />

    <label for="suggested-mastery-focus-count">{$t('settings.advanced.suggested-mastery-focus-count')}</label>
    <input
        id="suggested-mastery-focus-count"
        class="input number"
        type="number"
        min="1"
        max="10"
        step="1"
        value={settings.advanced.suggestedMasteryFocusCount}
        onchange={(e) => updateNumber('suggestedMasteryFocusCount', e)}
    />
    <label for="edit-progress-manually">{$t('settings.advanced.edit-progress-manually')}</label>
    <span class="switch-row">
        <Switch
            title={$t('settings.advanced.edit-progress-manually')}
            state={settings.advanced.editProgressManually}
            icon='bx-check'
            onToggle={toggleEditProgressManually}
        />
    </span>
</div>

<p>{$t('settings.advanced.migrate-legacy-progress')}</p>
<div class="right">
    <button class="default" onclick={migrateLegacyProgress}>{$t('settings.advanced.migrate-button')}</button>
</div>

<style>
    .number {
        margin-left: auto;
        width: 6rem;
        text-align: right;
    }

    .switch-row {
        margin-left: auto;
    }
</style>