<script lang="ts">
    import { createEventDispatcher } from 'svelte';
	import AuthService from '../../service/auth.service';

    const dispatch = createEventDispatcher();
	const authService = new AuthService();
	let email = import.meta.env.DEV ? 'john.doe@example.com' : '';
	let password = import.meta.env.DEV ? 'john.doe@example.com' : '';
	let termsofuse = import.meta.env.DEV;

	async function signUp() {
		try {
			await authService.signUp(email, password);
		} catch (error) {
            console.error(error);
            dispatch('error', error.message);
		}
	}
	
	async function useGoogle(ev: Event) {
		try {
			await authService.loginWithGoogle();
		} catch (error) {
            console.error(error);
            dispatch('error', error.message);
		}
	}
</script>

<section class="menu">
	<div>
		<label for="email">Email</label>
		<input id="email" autocomplete="email" type="text" placeholder="email" bind:value={email}>
		<label for="password">Password</label>
		<input id="password" autocomplete="password" type="password" placeholder="password" bind:value={password}>
		<label for="new-password">Repeat</label>
		<input id="new-password" autocomplete="new-password" type="password" placeholder="password" bind:value={password}>
		<p>
			<input id="termsofuse" type="checkbox" bind:checked={termsofuse} /> <a href="#/">Terms of use</a>
		</p>
	</div>
    <div>
        <button title="Sign up" on:click={signUp} disabled={!termsofuse}>
            <i class='bx bxs-edit'></i> Sign up
        </button>
    </div>
    <div>
        <button id='google' title="Sign in with Google" on:click={useGoogle}>
            <i class='bx bxl-google'></i> Using Google
        </button>
    </div>
</section>

<style lang="scss">
	
</style>