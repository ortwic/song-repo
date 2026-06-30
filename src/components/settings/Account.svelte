<script lang='ts'>
    import { t } from 'svelte-i18n';
    import { authService } from '../../service/user/auth.service';
    import { showError, showInfo } from '../../store/notification.store';

    const MIN_PASSWORD_LENGTH = 6;

    let newPassword = $state('');
    let confirmPassword = $state('');
    let isSaving = $state(false);

    let isLengthValid = $derived(newPassword.length >= MIN_PASSWORD_LENGTH);
    let isConfirmed = $derived(confirmPassword.length > 0 && newPassword === confirmPassword);
    let isMismatch = $derived(confirmPassword.length > 0 && newPassword !== confirmPassword);
    let canSave = $derived(isLengthValid && isConfirmed && !isSaving);

    function resetForm() {
        newPassword = '';
        confirmPassword = '';
    }

    async function changePassword() {
        if (canSave) {
            isSaving = true;
            try {
                await authService.updatePassword(newPassword);
                showInfo($t('settings.account.change-pwd-done'));
                resetForm();
            } catch (error) {
                showError(error.message);
            } finally {
                isSaving = false;
            }
        }
    }
</script>

<div class="section grid-max-2">
    <label for="newPassword">{$t('settings.account.new-password')}</label>
    <div class="password-wrap">
        <input id="newPassword" type="password" class="input lg"
            class:is-valid={newPassword.length > 0 && isLengthValid}
            class:is-invalid={newPassword.length > 0 && !isLengthValid}
            bind:value={newPassword}
            placeholder={$t('settings.account.new-password')} />
        {#if newPassword.length > 0 && !isLengthValid}
            <span class="password-hint invalid">
                <i class="bx bx-x"></i> {$t('settings.account.password-too-short', {
                    values: {
                        count: MIN_PASSWORD_LENGTH
                    }
                })}
            </span>
        {/if}
    </div>

    <label for="confirmPassword">{$t('settings.account.confirm-password')}</label>
    <div class="password-wrap">
        <input id="confirmPassword" type="password" class="input lg"
            class:is-valid={isConfirmed}
            class:is-invalid={isMismatch}
            bind:value={confirmPassword}
            placeholder={$t('settings.account.confirm-password')} />
        {#if isMismatch}
            <span class="password-hint invalid">
                <i class="bx bx-x"></i> {$t('settings.account.password-mismatch')}
            </span>
        {:else if isConfirmed}
            <span class="password-hint valid">
                <i class="bx bx-check"></i> {$t('settings.account.password-match')}
            </span>
        {/if}
    </div>
</div>
<p style="text-align: right;">
    <button class="primary" disabled={!canSave} onclick={changePassword}>
        {$t('settings.account.change-password')}
    </button>
</p>

<style lang="scss">
    input {
        width: calc(100% - 1em);
    }
    .password-wrap {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
    }
    .password-hint {
        font-size: 0.8em;
        display: flex;
        align-items: center;
        gap: 0.2em;
    }
    .valid    { color: var(--success, green); }
    .invalid  { color: var(--danger,  red);   }
    input.is-valid   { border-color: var(--success, green); }
    input.is-invalid { border-color: var(--danger,  red);   }
</style>