<script lang='ts'>
    import ConfirmDialog from '../ui/ConfirmDialog.svelte';
    import AuthService, { currentUser } from "../../service/auth.service";
    import { getCssVariable } from "../../styles/style.helper";
    import { showError, showInfo } from '../../store/notification.store';

    export let displayName: string;
    export let photoURL: string;
    export let email: string;
	export let color = getCssVariable('--primary');
    let showConfirmDelete = false;

    const emailParts = email.split('@');
	const authService = new AuthService();

	async function copyLink(): Promise<void> {
		try {
			const link = `${location.origin}/@${$currentUser.uid}`;
			await navigator.clipboard.writeText(link);
			showInfo('Copied link for sharing into clipboard.');
		} catch (error) {
			showError(error);
		}
	}

	async function signOut(): Promise<void> {
		await authService.signOut();
    	history.pushState(null, '', location.origin);
	}
    
	async function deleteProfile({ detail: accepted }) {
        showConfirmDelete = false;
        if (accepted) {
            try {                
                await authService.deleteUser();
                showInfo('Your account was deleted successfully!');
            } catch (error) {
                showError(error.message);
            }
        }
	}
</script>

<section class="menu">
	<span class="profil">
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
	</span> 

	<div class="row">
		<button data-close title="Sign out '{email}'" on:click={signOut}>
			<span><i class='bx bx-log-out-circle'></i> Logout</span>
		</button>
	</div>
	<div class="row">
		<button title="Delete account '{email}'" 
			on:click={() => showConfirmDelete = true}>
			<span><i class='bx bx-error danger-text'></i> Delete profil</span>
		</button>
	</div>
	<div class="row">
		<button title="Copy link to share" on:click={copyLink}>
			<i class='bx bx-link'></i> Copy link to share
		</button>
	</div>

	{#if showConfirmDelete}
	<ConfirmDialog title='Confirm deletion' size='auto' target='login' on:closed={deleteProfile}>
		<p>Do you really like to delete account? All data will be lost.</p>
		<p>You should export your data before deletion.</p>
	</ConfirmDialog>
	{/if}
</section>

<style lang="scss">
    span.profil {
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