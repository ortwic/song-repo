<script lang='ts'>
    import { t } from 'svelte-i18n';
    import { slide } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';
	import AuthService from '../../service/auth.service';
    import { showError } from '../../store/notification.store';
    import { currentMenu } from '../../store/app.store';
    
    const slideParams = { duration: 200, easing: cubicOut };
	const authService = new AuthService();
	let email = import.meta.env.DEV ? 'john.doe@example.com' : '';
	let password = import.meta.env.DEV ? 'john.doe@example.com' : '';
    let loginMenu = false;

	async function signIn(ev: MouseEvent) {
		try {
			await authService.signIn(email, password);
            currentMenu.set('root');
		} catch (error) {
            if (`${error.message}`.includes('auth/wrong-password')) {
                showError(`${ $t('menu.login.wrong-password') }`);
                loginMenu = true;
            } else {
                showError(error.message);
            }
		}
	}
    
	async function resetPassword(ev: Event) {
		try {
			await authService.sendPasswordResetEmail(email);
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
    
	async function useMicrosoft(ev: Event) {
		try {
			await authService.loginWithMicrosoft();
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
        <button disabled={!password} title="{ $t('menu.login.login') }" on:click={signIn}>
            <i class='bx bx-log-in-circle'></i> { $t('menu.login.login') }
        </button>
    </div>
    {#if loginMenu}
    <div class="row" in:slide={slideParams} out:slide={slideParams}>
        <button class="warn" data-close title="{ $t('menu.login.reset-password') } '{email}'" on:click={resetPassword}>
            <i class='bx bx-envelope'></i> { $t('menu.login.reset-password') }
        </button>
    </div>
    {/if}
    <div class="row">
        <button data-close title="{ $t('menu.login.with-google') }" on:click={useGoogle}>
            <i class='bx bxl-google'></i> { $t('menu.login.with-google') }
        </button>
    </div>
    <div class="row">
        <button data-close title="{ $t('menu.login.with-microsoft') }" on:click={useMicrosoft}>
            <i class='bx bxl-microsoft'></i> { $t('menu.login.with-microsoft') }
        </button>
    </div>
</section>
