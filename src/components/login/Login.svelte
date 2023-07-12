<script lang='ts'>
    import { createEventDispatcher } from 'svelte';
    import Profil from '../login/Profil.svelte';
    import ConfirmDialog from '../ui/ConfirmDialog.svelte';
	import AuthService, { currentUser } from '../../service/auth.service';
    import { showError, showInfo } from '../../store/notification.store';
    
    const dispatch = createEventDispatcher();
	const authService = new AuthService();
	let email = import.meta.env.DEV ? 'john.doe@example.com' : '';
	let password = import.meta.env.DEV ? 'john.doe@example.com' : '';
    let showConfirmDelete = false;

	async function signIn(ev: Event) {
		try {
			await authService.signIn(email, password);
		} catch (error) {
            console.error(error);
            showError(error.message);
		}
	}
    
	async function useGoogle(ev: Event) {
		try {
			await authService.loginWithGoogle();
		} catch (error) {
            console.error(error);
            showError(error.message);
		}
	}
    
	async function deleteProfile({ detail: accepted }) {
        showConfirmDelete = false;
        if (accepted) {
            try {                
                await authService.deleteUser();
                showInfo('Your account was deleted successfully!');
            } catch (error) {
                console.log(error);
                showError(error.message);
            }
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
        <button data-close title="Sign out '{$currentUser.email}'" on:click={authService.signOut}>
            <span><i class='bx bx-log-out-circle'></i> Logout</span>
        </button>
    </div>
    <div>
        <button title="Delete account '{$currentUser.email}'" 
            on:click={() => showConfirmDelete = true}>
            <span><i class='bx bx-error danger-text'></i> Delete profil</span>
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
        <button data-close class="w50 highlight" title="Sign in" on:click={signIn}>
            <i class='bx bx-log-in-circle'></i> Login
        </button><button data-target='signup' class="w50" title="Sign up" on:click={() => dispatch('signup')}>
            <i class='bx bxs-edit'></i> Sign up
        </button>
    </div>
    <div>
        <button data-close title="Sign in with Google" on:click={useGoogle}>
            <i class='bx bxl-google'></i> Login with Google
        </button>
    </div>
    {/if}

    {#if showConfirmDelete}
    <ConfirmDialog title='Confirm deletion' size='auto' target='login' on:closed={deleteProfile}>
        <p>Do you really like to delete account? All data will be lost.</p>
        <p>You should export your data before deletion.</p>
    </ConfirmDialog>
    {/if}
</section>