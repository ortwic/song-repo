<script lang='ts'>
  import { currentUser, signOut } from '../../service/auth.service';
  import { loginWithGoogle } from '../../service/firebase.setup';
  import Profile from './Profile.svelte';
  import Button from '@smui/button';
</script>

<section>
	{#if $currentUser}
		<Profile displayName={$currentUser.displayName}
				 email={$currentUser.email}
				 photoURL={$currentUser.photoURL} />
		<Button on:click={ () => signOut() }>Logout</Button>
        
	{:else}
		<Button on:click={loginWithGoogle}>
			Signin with Google
		</Button>
	{/if}
</section>