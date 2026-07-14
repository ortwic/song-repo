<script lang='ts'>
    import { t } from 'svelte-i18n';
    import { onDestroy } from 'svelte';
    import { currentProfile } from '../../service/user/user.service';
    import { toClipboard } from '../ui/helper/input.helper';
    import { generateQRCode } from '../actions/qrcode.action';

    let {
        showPreview = true,
        showQRDownload = true,
    } = $props();

    let shareLink = $state('');
    let qrCodeUrl = $state('');

    const sub = currentProfile.subscribe((profile) => {
        if (profile) {
            shareLink = profile.alias 
                ? `${window.location.origin}/@${profile.alias}` 
                : `${window.location.origin}/#/songs/@${profile.id}`;
        }
    });

    onDestroy(() => sub?.unsubscribe());
</script>

<section class="menu">
    {#if showPreview}
    <div class="row">
        <button data-close title="{ $t('profile.preview-linkhub') }" onclick={() => window.open(shareLink) }>
            <i class='bx bx-sitemap'></i> { $t('profile.preview-linkhub') }
        </button>
    </div>
    {/if}
    <div class="row">
        <button title="{ $t('profile.share-link') }" onclick={() => toClipboard(shareLink)}>
            <i class='bx bx-share-alt'></i> { $t('profile.share-link') }
        </button>
    </div>
    {#if showQRDownload}
    <div class="row">
        <a role="button" href="{qrCodeUrl}" 
            title="{ $t('profile.download-qrcode') } (@{$currentProfile.alias ?? $currentProfile.id})"
            download="QR-{$currentProfile.alias ?? $currentProfile.id}.png">
            <i class='bx bx-qr'></i> { $t('profile.download-qrcode') }
        </a>
    </div>
    {/if}
    <p class="center">
        <canvas id="qrcode" use:generateQRCode={{
            text: shareLink,
            onCreated: (dataUrl) => qrCodeUrl = dataUrl
        }}></canvas>
    </p>
</section>

<style lang="scss">

</style>