<script lang='ts'>
  import { currentUser, signOut } from '../../service/auth.service';
  import { loginWithGoogle } from '../../service/firebase.setup';
  import Profile from './Profile.svelte';
</script>

<section>
	{#if $currentUser}
		<Profile displayName={$currentUser.displayName}
				 email={$currentUser.email}
				 photoURL={$currentUser.photoURL} />
		<button on:click={ () => signOut() }>Logout</button>
        
	{:else}
		<button on:click={loginWithGoogle}>
			Signin with Google
		</button>
	{/if}
</section>