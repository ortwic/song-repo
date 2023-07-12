<script lang="ts">
    import ConfirmDialog from '../ui/ConfirmDialog.svelte';
	import AuthService from '../../service/auth.service';
    import { showError } from '../../store/notification.store';
	
	interface RequiredPageChecks {
		termsofuse: boolean;
		privacypolicy: boolean;
	}

	const checkedIcon = 'bx bxs-check-circle bx-sm success-text';
	const uncheckedIcon = 'bx bx-circle bx-sm';
	const authService = new AuthService();

	let email = import.meta.env.DEV ? 'john.doe@example.com' : '';
	let password1 = import.meta.env.DEV ? 'john.doe@example.com' : '';
	let password2 = import.meta.env.DEV ? 'john.doe@example.com' : '';
	let page: keyof RequiredPageChecks;

	const checks: RequiredPageChecks = {
		privacypolicy: import.meta.env.DEV,
		termsofuse: import.meta.env.DEV,
	 };

	function confirm({ detail: accepted }) {		
		checks[page] = accepted;
		page = undefined;
	}

	async function signUp() {
		try {
			await authService.signUp(email, password1);
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

	$: valid = password1 === password2 && Object.values(checks).every(v => v);
</script>

<section class="menu">
	<div>
		<label for="email">Email</label>
		<input id="email" autocomplete="email" type="email" placeholder="email" bind:value={email}>
		<label for="password">Password</label>
		<input id="password" autocomplete="password" type="password" placeholder="password" bind:value={password1}>
		<label for="new-password">Repeat password</label>
		<input id="new-password" autocomplete="new-password" type="password" placeholder="repeat password" bind:value={password2}>
		<br/>
	</div>
    <div>
		<a role="button" title="Read privacy policy" href="#/" on:click={() => page = 'privacypolicy'}>
			<span class="caption">
				<i class={checks.privacypolicy ? checkedIcon : uncheckedIcon}></i>
				<span>Read privacy policy</span>
			</span>
		</a>
    </div>
    <div>
		<a role="button" title="Read terms of use" href="#/" on:click={() => page = 'termsofuse'}>
			<span class="caption">
				<i class={checks.termsofuse ? checkedIcon : uncheckedIcon}></i>
				<span>Read terms of use</span>
			</span>
		</a>
    </div>
    <div>
        <button title="Sign up" on:click={signUp} 
			disabled={!valid}>
            <i class='bx bxs-edit'></i> Sign up
        </button>
    </div>
    <div>
        <p>&ndash; or &ndash;</p>
    </div>
    <div>
        <button id='google' title="Sign up with Google" on:click={useGoogle}
			disabled={!valid}>
            <i class='bx bxl-google'></i> With Google
        </button>
    </div>

	{#if page}
	<ConfirmDialog target='signup' size='full' on:closed={confirm}>
		<object title="Embedded page '{page}'" data="/docs/{page}.html#{navigator.language}">
		</object>
	</ConfirmDialog>
	{/if}
</section>

<style lang="scss">	
	span.caption {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 2px;

		span {
			padding-bottom: .6em;
			text-align: left;
			min-width: 9rem;
		}
	}

	div > p {
		color: gray;
		text-align: center;
	}
    
	object {
		border: 0;
		width: 100%;
		flex-grow: 1;
	}
</style>