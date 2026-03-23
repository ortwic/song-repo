<script lang='ts'>
    import { t } from 'svelte-i18n';
    import { push } from 'svelte-spa-router';
    import { currentUser } from "../../service/auth.service";
    import { currentProfile } from '../../service/user.service';
    import { showError, showInfo } from "../../store/notification.store";
    import UserIcon from '../ui/Avatar.svelte';

    export let displayName: string;
    export let photoURL: string;
    export let email: string;

    const emailParts = email.split('@');

	async function copyLink(): Promise<void> {
		try {
			const link = $currentProfile.alias 
				? `${location.origin}/@${$currentProfile.alias}` 
				: `${location.origin}/#/songs/@${$currentUser.uid}`;
			await navigator.clipboard.writeText(link);
			showInfo($t('profile.share-link-copied'));
		} catch (error) {
			showError(error);
		}
	}
</script>

<section class="menu">
	<div class="row">
		<button class="profil" data-close title="{ $t('settings.title') }" on:click={() => push('/settings')}>
			<UserIcon {photoURL} width="50" title={email} />
			{#if displayName}
			<span class="name">{displayName}</span>
			{:else}
			<span class="name smaller">{emailParts[0]}<br/>@{emailParts[1]}</span>
			{/if}
		</button>
	</div>
	<div class="row">
		<button title="{ $t('profile.share-link') }" on:click={copyLink}>
			<i class='bx bx-share-alt'></i> { $t('profile.share-link') }
		</button>
	</div>
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