<script lang='ts'>
    import { t } from 'svelte-i18n';
    import { slide } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';
    import MenuButton from '../ui/elements/MenuButton.svelte';
    import { authService } from '../../service/user/auth.service';
    import { showError } from '../../store/notification.store';

    const slideParams = { duration: 200, easing: cubicOut };
    let email = $state(import.meta.env.DEV ? 'john.doe@example.com' : '');
    let password = $state(import.meta.env.DEV ? 'password' : '');
    let loginMenu = $state(false);

    async function signIn(ev: MouseEvent) {
        try {
            await authService.signIn(email, password);
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
        <MenuButton disabled={!password} title={ $t('menu.login.login') } onclick={signIn}>
            <i class='bx bx-log-in-circle'></i> { $t('menu.login.login') }
        </MenuButton>
    </div>
    {#if loginMenu}
    <div class="row" in:slide={slideParams} out:slide={slideParams}>
        <MenuButton className="warn" title="{ $t('menu.login.reset-password') } '{email}'" onclick={resetPassword}>
            <i class='bx bx-envelope'></i> { $t('menu.login.reset-password') }
        </MenuButton>
    </div>
    {/if}
    <div class="row">
        <MenuButton title={ $t('menu.login.with-google') } onclick={useGoogle}>
            <i class='bx bxl-google'></i> { $t('menu.login.with-google') }
        </MenuButton>
    </div>
    <div class="row">
        <MenuButton title={ $t('menu.login.with-microsoft') } onclick={useMicrosoft}>
            <i class='bx bxl-microsoft'></i> { $t('menu.login.with-microsoft') }
        </MenuButton>
    </div>
</section>
