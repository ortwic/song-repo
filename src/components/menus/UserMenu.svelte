<script lang='ts'>
    import { t } from 'svelte-i18n';
    import { push } from 'svelte-spa-router';
	import QRCode from 'qrcode';
    import { map } from 'rxjs';
    import { currentProfile } from '../../service/user.service';
    import { showError, showInfo } from "../../store/notification.store";
    import UserIcon from '../ui/Avatar.svelte';

    export let displayName: string;
    export let photoURL: string;
    export let email: string;

    const emailParts = email.split('@');
	const shareLink = currentProfile.pipe(
		map((p) => p.alias 
			? `${location.origin}/@${p.alias}` 
			: `${location.origin}/#/songs/@${p.id}`
		)
	);

	let qrCodeUrl = '';
	let qrCodeCanvas: HTMLCanvasElement;
	$: if ($currentProfile && qrCodeCanvas) {
		setQRCodeUrl($shareLink);
	}

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
				dark: '#000000ff',
				light: '#ffffff00'
			}
		});

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
	<div class="row">
		<button class="profil" data-close title="{ $t('settings.title') }" on:click={() => push('/settings')}>
			<UserIcon {photoURL} size="50px" title={email} />
			{#if displayName}
			<span class="name">{displayName}</span>
			{:else}
			<span class="name smaller">{emailParts[0]}<br/>@{emailParts[1]}</span>
			{/if}
		</button>
	</div>
	<div class="row">
		<button title="{ $t('profile.share-link') }" on:click={() => copyText($shareLink)}>
			<i class='bx bx-share-alt'></i> { $t('profile.share-link') }
		</button>
	</div>
	<div class="row">
		<a role="button" href="{qrCodeUrl}" 
			title="{ $t('profile.download-qrcode') } (@{$currentProfile.alias ?? $currentProfile.id})"
			download="QR-{$currentProfile.alias ?? $currentProfile.id}.png">
			<i class='bx bx-qr'></i> { $t('profile.download-qrcode') }
		</a>
	</div>
	<p>
		<canvas id="qrcode" bind:this={qrCodeCanvas}></canvas>
	</p>
	
</section>

<style lang="scss">
    .profil {
        display: flex;
		justify-content: center;
		align-content: center;
		align-items: center;
		padding: .4em 0;

		img {
			vertical-align: middle;
			border-radius: 2em;
		}

		span.name {
			padding: 0 .4em;
			max-width: 8em;
			word-wrap: break-word;
			word-break: break-all;
			overflow: hidden;
		}

		.smaller {
			font-size: smaller;
		}
    }
</style>