<script lang='ts'>
    import { t } from 'svelte-i18n';
    import QRCode from 'qrcode';
    import { onDestroy } from 'svelte';
    import { currentProfile } from '../../service/user/user.service';
    import { showError, showInfo } from "../../store/notification.store";
    import { getCssVariable } from '../../styles/style.helper';

    let {
        showPreview = true,
        showQRDownload = true,
    } = $props();

    let shareLink = $state('');
    let qrCodeUrl = $state('');
    let qrCodeCanvas: HTMLCanvasElement = $state();

    const sub = currentProfile.subscribe((p) => {
        shareLink = p.alias 
            ? `${window.location.origin}/@${p.alias}` 
            : `${window.location.origin}/#/songs/@${p.id}`;
        setQRCodeUrl(shareLink);
    });

    onDestroy(() => sub?.unsubscribe());

    async function setQRCodeUrl(text: string) {
        function drawWhiteCircle(center: number, size: number): void {
            ctx.beginPath();
            ctx.arc(center, center, size, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        }

        async function drawLogo(center: number, size: number): Promise<void> {
            const logo = new Image();
            logo.src = '/logo.svg';
            await new Promise(resolve => logo.onload = resolve);

            const pos = center - size / 2.15;
            ctx.drawImage(logo, pos, pos, size, size);
        }

        await QRCode.toCanvas(qrCodeCanvas, text, {
            errorCorrectionLevel: 'H',
            width: 128,
            margin: 0,
            color: {
                dark: `${getCssVariable('--text')}`,
                light: '#ffffff00'
            }
        });

        if (!qrCodeCanvas) {
            return;
        }

        const ctx = qrCodeCanvas.getContext('2d');
        const center = qrCodeCanvas.width / 2;
        const size = qrCodeCanvas.width * 0.18;

        drawWhiteCircle(center, size * 0.66);
        await drawLogo(center, size);

        qrCodeUrl = qrCodeCanvas.toDataURL('image/png');
    }

    async function copyText(text: string): Promise<void> {
        try {
            await navigator.clipboard.writeText(text);
            showInfo($t('profile.share-link-copied'));
        } catch (error) {
            showError(error);
        }
    }
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
        <button title="{ $t('profile.share-link') }" onclick={() => copyText(shareLink)}>
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
        <canvas id="qrcode" bind:this={qrCodeCanvas}></canvas>
    </p>
</section>

<style lang="scss">

</style>