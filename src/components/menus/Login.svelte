<script lang='ts'>
    import { createEventDispatcher } from 'svelte';
	import AuthService, { currentUser } from '../../service/auth.service';
    import { showError } from '../../store/notification.store';
    
    const dispatch = createEventDispatcher();
	const authService = new AuthService();
	let email = import.meta.env.DEV ? 'john.doe@example.com' : '';
	let password = import.meta.env.DEV ? 'john.doe@example.com' : '';

	async function signIn(ev: Event) {
		try {
			await authService.signIn(email, password);
		} catch (error) {
            showError(error.message);
		}
	}
    
	async function useGoogle(ev: Event) {
		try {
			await authService.loginWithGoogle();
		} catch (error) {
            showError(error.message);
		}
	}
</script>

<section class="menu">
    <div class="section">
        <label for="email">Email</label>
        <input id="email" autocomplete="email" type="text" placeholder="email" bind:value={email}>
        <label for="password">Password</label>
        <input id="password" autocomplete="password" type="password" placeholder="password" bind:value={password}>
        <br/>
    </div>
    <div class="row">
        <button data-close class="highlight" title="Sign in" on:click={signIn}>
            <i class='bx bx-log-in-circle'></i> Login
        </button>
        <button data-target='signup' title="Sign up" on:click={() => dispatch('signup')}>
            <i class='bx bxs-edit'></i> Sign up
        </button>
    </div>
    <div class="row">
        <button data-close title="Sign in with Google" on:click={useGoogle}>
            <i class='bx bxl-google'></i> Login with Google
        </button>
    </div>
</section>