<script lang='ts'>
    import { t } from 'svelte-i18n';
    import PopupMenu from '../ui/PopupMenu.svelte';
    import SettingsDialog from '../dialogs/SettingsDialog.svelte';
    import AuthService from "../../service/auth.service";
    import { getCssVariable } from "../../styles/style.helper";

    export let displayName: string;
    export let photoURL: string;
    export let email: string;
	export let color = getCssVariable('--primary');
	let profileMenu: PopupMenu;
	let settings: SettingsDialog;

    const emailParts = email.split('@');
	const authService = new AuthService();

	async function signOut(): Promise<void> {
		await authService.signOut();
    	history.pushState(null, '', location.origin);
	}
</script>

<section class="menu">
	<div class="row">
		<button class="profil" on:click={(event) => profileMenu.showPopupMenu(event)}>
			{#if photoURL}
			<img src={photoURL} width="50" alt={email} title={email}>	
			{:else}
			<span class="generic">
				<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<g id="SVGRepo_bgCarrier" stroke-width="0"></g>
					<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
					<g id="SVGRepo_iconCarrier"> 
						<circle cx="12" cy="12" r="10" stroke={color} fill="white" stroke-width="1.5"></circle> 
						<circle opacity="0.5" cx="12" cy="9" r="3" stroke={color} stroke-width="1.5"></circle> 
						<path opacity="0.5" d="M17.9691 20C17.81 17.1085 16.9247 15 11.9999 15C7.07521 15 6.18991 17.1085 6.03076 20" stroke={color} stroke-width="1.5" stroke-linecap="round"></path> 
					</g>
				</svg>
			</span>
			{/if}
			{#if displayName}
			<span class="name">{displayName}</span>
			{:else}
			<span class="name smaller">{emailParts[0]}<br/>@{emailParts[1]}</span>
			{/if}
		</button> 

		<PopupMenu bind:this={profileMenu} width="200px">
			<div class="row">
				<button class="left" data-close title="{ $t('profile.sign-out') } '{email}'" on:click={signOut}>
					<span><i class='bx bx-log-out-circle'></i> { $t('profile.sign-out') }</span>
				</button>
			</div>
			<div class="row">
				<button class="left" title="{ $t('profile.settings') } '{email}'" on:click={settings.showDialog}>
					<span><i class='bx bx-cog'></i> { $t('profile.settings') }</span>
				</button>
			</div>
		</PopupMenu>

		<SettingsDialog bind:this={settings} />
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

		span.generic {
			width: 50px;
			height: 50px;
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