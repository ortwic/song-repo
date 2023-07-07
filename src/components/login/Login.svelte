<script lang='ts'>
	import LoginIcon from './LoginIcon.svelte';
	import LogoutIcon from './LogoutIcon.svelte';
	import SignupDialog from './SignupDialog.svelte';
	import AuthService, { currentUser } from '../../service/auth.service';

	const authService = new AuthService();
	let dialog: SignupDialog;
</script>

{#if $currentUser}
	<button title="Sign out '{$currentUser.email}'" class="primary icon" on:click={authService.signOut}>
		{#if $currentUser.photoURL}
		<img src={$currentUser.photoURL} width="46" alt={$currentUser.displayName}>
		{:else}
		<LogoutIcon color="whitesmoke" />
		{/if}
	</button>
{:else}
	<button title="Sign in" class="primary icon" on:click={() => dialog.showModal()}>
		<LoginIcon color="whitesmoke" />
	</button>
{/if}

<SignupDialog bind:this={dialog} />

<style>
	img {
		vertical-align: middle;
		border-radius: 2em;
	}
</style>