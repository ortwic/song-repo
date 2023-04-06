<script lang='ts'>
    import Profile from './Profile.svelte';

    import { auth, loginWithGoogle } from '../../service/firebase.setup';
    import { authState } from 'rxfire/auth';
    import { Observable, map, filter, switchMap } from 'rxjs';
    import Button from '@smui/button';
    import FirestoreService from '../../service/firestore.service';
    import type { Song } from '../../model/song.model';

    const store = new FirestoreService('songs');
    
    export let user = authState(auth);
    export let data: Observable<Song[]>;
    
    $: data = user.pipe(
      switchMap(user => user ? store.getDocuments(user.uid) : []),
      map((value) => value as Song[])
    );
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