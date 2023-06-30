<script lang="ts">
	import AuthService from '../../service/auth.service';
    import Snackbar from '../Snackbar.svelte';

	const authService = new AuthService();
    let snackbar: Snackbar;
	let dialog: HTMLDialogElement;
	let email = import.meta.env.DEV ? 'john.doe@example.com' : '';
	let password = import.meta.env.DEV ? 'john.doe@example.com' : '';

	export function showModal() {
		dialog.showModal();
	}

	async function signIn() {
		try {
			await authService.signIn(email, password);
			dialog.close();
		} catch (error) {
			snackbar.error(error);
		}
	}

	async function signUp() {
		try {
			await authService.signUp(email, password);
			dialog.close();
		} catch (error) {
			snackbar.error(error);
		}
	}

	async function useGoogle() {
		try {
			await authService.loginWithGoogle();
			dialog.close();
		} catch (error) {
			snackbar.error(error);
		}
	}
</script>

<Snackbar bind:this={snackbar} />

<dialog bind:this={dialog} on:close>
	<form method="dialog">
		<header>
			<div>Sign in or sign up</div>
			<button class="icon" value="cancel">✕</button>
		</header>
		<main>
			<p>
				<label for="email">Email</label>
				<input id="email" autocomplete="email" type="text" placeholder="email" bind:value={email}>
			</p>
			<p>
				<label for="password">Password</label>
				<input id="password" autocomplete="password" type="password" placeholder="password" bind:value={password}>
			</p>
		</main>
		<footer>			
			<div>
				<button title="Sign in with Google" on:click|preventDefault={signUp}>
					Sign up
				</button>
				<button class="primary" title="Sign in with Google" on:click|preventDefault={signIn}>
					Sign in
				</button>
			</div>
			<hr/>
			<div>
				<button style="width: 100%" title="Sign in with Google" on:click|preventDefault={useGoogle}>
					Use Google
				</button>
			</div>
		</footer>
	</form>
</dialog>

<style>
	label, input[type=text], input[type=password] {
		padding: .4rem;
	}

	dialog {
		border: 1px solid black;
		border-radius: 1rem;
		box-shadow: 5px 5px 5px silver;
		opacity: 0;
  		transition: transform .5s ease 0s, opacity .5s ease .5s;
	}

	dialog[open] {
		opacity: 1;
	}

	dialog header {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		padding: .4rem 1rem;
		font-size: large;
		color: whitesmoke;
		background-color: var(--primary);
	}

	dialog header div {
		float: left;
	}

	button.icon {
		float: right;
		color: whitesmoke;
		background-color: transparent;
		box-shadow: unset;
		border: 0;
		outline: 0;
		padding: 0;
	}

	button.icon:hover {
		text-shadow: 0 0 4px white;
	}

	dialog main {
		margin-top: 3rem;
		margin-bottom: 1.8rem;
	}

	dialog main p input {
		float: right;
	}

	footer button {
		min-width: 10rem;
	}

	footer hr {
		margin: 1rem 0;
	}
</style>