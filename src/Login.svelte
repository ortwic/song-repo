<script>
    import Profile from './Profile.svelte';
    import List from './List.svelte';

    import { auth, loginWithGoogle } from './firebase';
    import { authState } from 'rxfire/auth';

    let user = authState(auth);  

    // const unsubscribe = authState(auth).subscribe(u => user = u);
</script>

<section>
	{#if $user}
		<Profile displayName={$user.displayName}
				 email={$user.email}
				 emailVerified={$user.emailVerified}
				 photoURL={$user.photoURL} />
		<button on:click={ () => auth.signOut() }>Logout</button>
		<hr>
		<List uid={$user.uid} />
	{:else}
		<button on:click={loginWithGoogle}>
			Signin with Google
		</button>
	{/if}
</section>