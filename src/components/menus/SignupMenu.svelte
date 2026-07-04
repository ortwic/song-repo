<script lang="ts">
    import { t } from 'svelte-i18n';
    import { authService } from '../../service/user/auth.service';
    import { logPageView, showError } from '../../store/notification.store';
    import { getPage } from '../../service/common/page.service';
    import { type DialogArgs, openDialog } from '../dialog-context.svelte';
    
    interface RequiredPageChecks {
        termsofuse: boolean;
        privacypolicy: boolean;
    }

    const MIN_PWD_LENGTH = 6;
    const checkedIcon = 'bx bxs-check-circle bx-sm';
    const uncheckedIcon = 'bx bx-circle bx-sm';

    let email = $state(import.meta.env.DEV ? 'john.doe@example.com' : '');
    let password = $state('');
    let pwdRepeat = $state('');

    const checks: RequiredPageChecks = $state({
        privacypolicy: false,
        termsofuse: false,
    });

    async function signUp() {
        try {
            await authService.signUp(email, password);
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

    async function showDialog(target: keyof RequiredPageChecks) {
        const title = $t('menu.login.read-carefully');
        const { body } = getPage(target) ?? { body: `Trouble while loading '${target}'` };
        checks[target] = await openDialog<DialogArgs, boolean>('ConfirmDialog', { 
            title, 
            body,
            size: 'full',
            target: 'signup'
        });
        logPageView({ page: 'signup', target });
    }

    let valid = $derived(password?.length >= MIN_PWD_LENGTH 
        && password === pwdRepeat 
        && Object.values(checks).every(v => v));
</script>

<section class="menu">
    <div class="section indent">
        <label for="email">{ $t('menu.login.email') }</label>
        <input id="email" autocomplete="email" type="email" placeholder="{ $t('menu.login.email') }" bind:value={email}>
        <label for="password">{ $t('menu.login.password') }</label>
        <input id="password" type="password" placeholder="{ $t('menu.login.password') }" bind:value={password}>
        <label for="new-password">{ $t('menu.login.repeat') }</label>
        <input id="new-password" type="password" placeholder="{ $t('menu.login.repeat') }" bind:value={pwdRepeat}>
        <br/>
    </div>
    <div class="row">
        <button title="{ $t('menu.login.read-privacy-policy') }" onclick={() => showDialog('privacypolicy')}>
            <span class="caption">
                <i class={checks.privacypolicy ? checkedIcon : uncheckedIcon}></i>
                <span>{ $t('menu.login.read-privacy-policy') }</span>
            </span>
        </button>
    </div>
    <div class="row">
        <button title="{ $t('menu.login.read-terms-of-use') }" onclick={() => showDialog('termsofuse')}>
            <span class="caption">
                <i class={checks.termsofuse ? checkedIcon : uncheckedIcon}></i>
                <span>{ $t('menu.login.read-terms-of-use') }</span>
            </span>
        </button>
    </div>
    <div class="row">
        <button data-close={valid ? '' : undefined} title="{ $t('menu.login.signup') }" onclick={signUp} 
            disabled={!valid}>
            <i class='bx bxs-edit'></i> { $t('menu.login.signup') }
        </button>
    </div>
    <div class="row">
        <p>&ndash; { $t('menu.or') } &ndash;</p>
    </div>
    <div class="row">
        <button id='google' title="{ $t('menu.login.with-google') }" onclick={useGoogle}
            disabled={!valid}>
            <i class='bx bxl-google'></i> { $t('menu.login.with-google') }
        </button>
    </div>
    <div class="row">
        <button id='microsoft' title="{ $t('menu.login.with-microsoft') }" onclick={useMicrosoft}
            disabled={!valid}>
            <i class='bx bxl-microsoft'></i> { $t('menu.login.with-microsoft') }
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

    .bxs-check-circle {
        color: var(--success);
    }
</style>