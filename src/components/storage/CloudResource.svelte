<script lang="ts">
    import { t } from 'svelte-i18n';
    import type { DriveFile } from '../../model/file.model';
    import { isGoogleUser } from '../../store/profile.store';
    import GoogleDrivePicker from './GoogleDrivePicker.svelte';
    import { marked } from 'marked';

    interface Props {
        title?: string;
        uri?: string;
    }

    let { title, uri = $bindable() }: Props = $props();

    const handlePick = (file: DriveFile) => {
        uri = file.url;
    };
</script>

<div class="label">
    <label for="uri">
        {title}
    </label>
    {#if uri}
        <a href={uri} title={$t('songs.resource.show')} target="_blank" rel="noopener">
            <i class="bx bx-show"></i> {$t('songs.resource.show')}
        </a>
    {/if}
    <GoogleDrivePicker disabled={!$isGoogleUser} onPick={handlePick} />
    {#if !$isGoogleUser}
        <div class="info-box">
            <i class="bx bx-info-circle"></i>
            <span>
                {@html marked($t('songs.resource.info'), { mangle: false, headerIds: false })}
            </span>
        </div>
    {/if}
</div>
<input class="lg"
    id="uri"
    type="url"
    title={$t('songs.hint-uri')}
    bind:value={uri}
    placeholder="https://example.com/files/my-sheet-music.pdf"
/>

<style lang="scss">
    .label {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.4em;
    }

    input {
        width: 100%;
    }
</style>
