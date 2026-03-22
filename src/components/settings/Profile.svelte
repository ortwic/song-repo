<script lang='ts'>
    import { t } from 'svelte-i18n';
    import { currentUser } from '../../service/auth.service';
    import UserService, { currentProfile$ } from '../../service/user.service';
    import { showError, showInfo } from '../../store/notification.store';

    const userService = new UserService();
    let userName: HTMLInputElement;
    let userAlias: HTMLInputElement;
    let userAbout: HTMLTextAreaElement;

    async function saveProfile() {
        try {
            await userService.updateProfile({
                id: $currentUser.uid,
                name: userName.value,
                about: userAbout.value
            });
            if (await userService.setAlias($currentUser.uid, userAlias.value)) {
                showInfo($t('settings.alias-updated'));
            } else {
                showError($t('settings.alias-exists'));
            }
        } catch (error) {
            showError(error.message);
        }
    }
</script>

<div class="section grid">
    <label for="name">Name</label>
    <input id="name" type="text" class="input lg" value={$currentProfile$.name} bind:this={userName} />

    <label for="alias">Alias @</label>
    <input id="alias" type="text" class="input lg" value={$currentProfile$.alias}
        bind:this={userAlias} placeholder={$t('settings.alias')} />

    <label for="about">{$t('settings.about')}</label>
    <textarea id="about" class="input" bind:this={userAbout}>{$currentProfile$.about || ''}</textarea>
</div>
<p style="text-align: right;">
    <button class="primary" on:click={saveProfile}>
        {$t('settings.update-profile')}
    </button>
</p>

<style>
    .grid {
        display: grid;
        grid-template-columns: auto 1fr;
        grid-gap: 1rem;
    }
</style>