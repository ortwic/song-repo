<script lang="ts">
    import ConfirmDialog from '../ui/ConfirmDialog.svelte';
    import { t } from '../../service/i18n';
	import AuthService from '../../service/auth.service';
    import { logPageView, showError } from '../../store/notification.store';
	
	interface RequiredPageChecks {
		termsofuse: boolean;
		privacypolicy: boolean;
	}

	const checkedIcon = 'bx bxs-check-circle bx-sm success-text';
	const uncheckedIcon = 'bx bx-circle bx-sm';
	const authService = new AuthService();

	let email = import.meta.env.DEV ? 'john.dev@example.com' : '';
	let password1 = import.meta.env.DEV ? 'john.dev@example.com' : '';
	let password2 = import.meta.env.DEV ? 'john.dev@example.com' : '';
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

	function load(target: keyof RequiredPageChecks) {
		page = target;
        logPageView({ page: 'signup', target });
	}

	$: valid = password1 === password2 && Object.values(checks).every(v => v);
</script>

<section class="menu">
	<div class="section indent">
		<label for="email">{ $t('menu.login.email') }</label>
		<input id="email" autocomplete="email" type="email" placeholder="{ $t('menu.login.email') }" bind:value={email}>
		<label for="password">{ $t('menu.login.password') }</label>
		<input id="password" type="password" placeholder="{ $t('menu.login.password') }" bind:value={password1}>
		<label for="new-password">{ $t('menu.login.repeat') }</label>
		<input id="new-password" type="password" placeholder="{ $t('menu.login.repeat') }" bind:value={password2}>
		<br/>
	</div>
    <div class="row">
		<button title="{ $t('menu.login.read-privacy-policy') }" on:click={() => load('privacypolicy')}>
			<span class="caption">
				<i class={checks.privacypolicy ? checkedIcon : uncheckedIcon}></i>
				<span>{ $t('menu.login.read-privacy-policy') }</span>
			</span>
		</button>
    </div>
    <div class="row">
		<button title="{ $t('menu.login.read-terms-of-use') }" on:click={() => load('termsofuse')}>
			<span class="caption">
				<i class={checks.termsofuse ? checkedIcon : uncheckedIcon}></i>
				<span>{ $t('menu.login.read-terms-of-use') }</span>
			</span>
		</button>

		{#if page}
		<ConfirmDialog title='{ $t('menu.login.read-carefully') }' target='signup' size='full' on:closed={confirm}>
			<object title="Embedded page '{page}'" data="/docs/{page}.html#{navigator.language}">
			</object>
		</ConfirmDialog>
		{/if}
    </div>
    <div class="row">
        <button title="{ $t('menu.login.signup') }" on:click={signUp} 
			disabled={!valid}>
            <i class='bx bxs-edit'></i> { $t('menu.login.signup') }
        </button>
    </div>
    <div class="row">
        <p>&ndash; { $t('menu.or') } &ndash;</p>
    </div>
    <div class="row">
        <button id='google' title="{ $t('menu.login.with-google') }" on:click={useGoogle}
			disabled={!valid}>
            <i class='bx bxl-google'></i> { $t('menu.login.with-google') }
        </button>
    </div>
</section>

<style lang="scss">	
	span.caption {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 2px;

		span {
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