<script lang='ts'>
    import { createEventDispatcher } from 'svelte';
    import Profil from '../login/Profil.svelte';
	import AuthService, { currentUser } from '../../service/auth.service';
    
    const dispatch = createEventDispatcher();
	const authService = new AuthService();
	let email = import.meta.env.DEV ? 'john.doe@example.com' : '';
	let password = import.meta.env.DEV ? 'john.doe@example.com' : '';

	async function signIn(ev: Event) {
		try {
			await authService.signIn(email, password);
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
    {#if $currentUser}
    <Profil email={$currentUser.email}
        photoURL={$currentUser.photoURL} 
        displayName={$currentUser.displayName} 
    />
    <div>
        <button id='signout' title="Sign out '{$currentUser.email}'" on:click={authService.signOut}>
            <span><i class='bx bx-log-out-circle'></i> Logout</span>
        </button>
    </div>
    {:else}
    <div>
        <label for="email">Email</label>
        <input id="email" autocomplete="email" type="text" placeholder="email" bind:value={email}>
        <label for="password">Password</label>
        <input id="password" autocomplete="password" type="password" placeholder="password" bind:value={password}>
        <br/>
    </div>
    <div>
        <button id='signin' class="w50 highlight" title="Sign in" on:click={signIn}>
            <i class='bx bx-log-in-circle'></i> Login
        </button><button id='signup' class="w50" title="Sign up" on:click={() => dispatch('signup')}>
            <i class='bx bxs-edit'></i> Sign up
        </button>
    </div>
    <div>
        <button id='google' title="Sign in with Google" on:click={useGoogle}>
            <i class='bx bxl-google'></i> Login with Google
        </button>
    </div>
    {/if}
</section>