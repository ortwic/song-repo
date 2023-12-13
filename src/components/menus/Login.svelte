<script lang='ts'>
    import { createEventDispatcher } from 'svelte';
    import { t } from '../../service/i18n';
	import AuthService from '../../service/auth.service';
    import { showError } from '../../store/notification.store';
    
    const dispatch = createEventDispatcher();
	const authService = new AuthService();
	let email = import.meta.env.DEV ? 'john.dev@example.com' : '';
	let password = import.meta.env.DEV ? 'john.dev@example.com' : '';

	async function signIn(ev: Event) {
		try {
			await authService.signIn(email, password);
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
</script>

<section class="menu">
    <div class="section indent">
        <label for="email">{ $t('menu.login.email') }</label>
        <input id="email" autocomplete="email" type="text" placeholder="{ $t('menu.login.email') }" bind:value={email}>
        <label for="password">{ $t('menu.login.password') }</label>
        <input id="password" type="password" placeholder="{ $t('menu.login.password') }" bind:value={password}>
        <br/>
    </div>
    <div class="row">
        <button data-close class="highlight" title="{ $t('menu.login.login') }" on:click={signIn}>
            <i class='bx bx-log-in-circle'></i> { $t('menu.login.login') }
        </button>
        <button data-target='signup' title="{ $t('menu.login.signup') }" on:click={() => dispatch('signup')}>
            <i class='bx bxs-edit'></i> { $t('menu.login.signup') }
        </button>
    </div>
    <div class="row">
        <button data-close title="{ $t('menu.login.with-google') }" on:click={useGoogle}>
            <i class='bx bxl-google'></i> { $t('menu.login.with-google') }
        </button>
    </div>
</section>