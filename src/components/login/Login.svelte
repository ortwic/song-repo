<script lang='ts'>
    import Profile from './Profile.svelte';

    import { auth, loginWithGoogle } from '../../service/firebase.setup';
    import { authState } from 'rxfire/auth';
    import { switchMap } from 'rxjs';
    import Button from '@smui/button';
    import FirestoreService from '../../service/firestore.service';
    import type { Song } from '../../model/song.model';
    import { songs } from '../../store/song.store';

    const store = new FirestoreService('songs');
    
    export let user = authState(auth);
    
    user.pipe(
      switchMap(user => user ? store.getDocuments(user.uid) : [])
    ).subscribe((value) => songs.set(value as Song[]));
</script>

<section>
	{#if $user}
		<Profile displayName={$user.displayName}
				 email={$user.email}
				 photoURL={$user.photoURL} />
		<Button on:click={ () => auth.signOut() }>Logout</Button>
        
	{:else}
		<Button on:click={loginWithGoogle}>
			Signin with Google
		</Button>
	{/if}
</section>