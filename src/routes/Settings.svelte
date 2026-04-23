<script lang='ts'>
    import { t } from 'svelte-i18n';
    import { link, push } from 'svelte-spa-router';
    import Profile from '../components/settings/Profile.svelte';
    import Linktree from '../components/settings/Linktree.svelte';
    import { slideFade } from '../components/ui/transition.helper';
    import Footer from '../components/ui/Footer.svelte';
    import AuthService, { currentUser } from '../service/auth.service';
    import UserService from '../service/user.service';
    import { currentMenu } from '../store/app.store';
    import { showError, showInfo } from '../store/notification.store';
    import '../styles/menu.scss';

    const authService = new AuthService();
    const userService = new UserService();
    let confirmDelete = false;

    async function signOut() {
        await authService.signOut();
        currentMenu.set('dynamic');
        push('/');
    }

    function resetViews() {
        localStorage.clear();
        showInfo($t('settings.reset-done'));
    }

    async function deleteProfile() {
        try {
            // #43 workaround as deleting user data requires delete-user-data extension
            await userService.setDeletedFlag($currentUser.uid);
            await authService.deleteUser();
            showInfo($t('settings.delete-done'));
        } catch (error) {
            showError(error.message);
        }
    }
</script>

<main class="content">
    <div class="titlebar">
        <i class="bx bx-cog"></i>&nbsp; {$t('settings.title')}
    </div>
    <section>
        {#if $currentUser}
        <div style="text-align: right;">
            <button class="primary" title={$t('profile.sign-out')} on:click={signOut}>
                <i class="bx bx-log-out-circle"></i>
                {$t('profile.sign-out')}
            </button>
        </div>
        <fieldset class="menu">
            <legend>{$t('settings.profile')}</legend>
            <p>
                <Profile />
            </p>
            <hr/>
            <p>
                <Linktree />
            </p>
        </fieldset>
        {/if}

        <fieldset>
            <legend>{$t('settings.view')}</legend>
            <div>
                <span>{$t('settings.reset-text')}</span>
                <button class="default" on:click={resetViews}>{$t('settings.reset-cookies')}</button>
            </div>
        </fieldset>

        {#if $currentUser}
            <fieldset class="menu danger">
                <legend>{$t('settings.danger-zone')}</legend>
                <div class="section danger-text">
                    <span>
                        <input id="delete" type="checkbox" bind:checked={confirmDelete} />
                        <label for="delete">{$t('settings.delete-profile')}</label>
                        ({$t('settings.data-lost')})
                    </span>
                    <button class="primary" disabled={!confirmDelete} on:click={deleteProfile}>
                        {$t('settings.delete-profile')}
                    </button>
                </div>
                {#if confirmDelete}
                    <span>
                        <div class="warn" in:slideFade={{ duration: 200 }} out:slideFade={{ duration: 200 }}>
                            {$t('settings.delete-advice')}
                        </div>
                    </span>
                {/if}
            </fieldset>
        {/if}
    </section>
    <Footer>
        <a use:link href="/docs/imprint">{ $t('start.imprint') }</a> |
        <a use:link href="/docs/privacypolicy">{ $t('start.privacypolicy') }</a> |
        <a use:link href="/docs/termsofuse">{ $t('start.termsofuse') }</a>
    </Footer>
</main>

<style lang="scss">
    main > section {
        padding: 1em 5%;
        max-width: 40em;

        fieldset,
        div {
            margin: 1rem;
            text-align: left;
            border-color: var(--primghost);

            legend,
            p {
                padding: 0 0.4rem;
            }

            label {
                display: inline;
            }

            & > div {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
        }

        .danger {
            border-color: red;
        }

        .warn {
            padding: 0.4em 1em;
            border: 1px solid gray;
            background-color: var(--secondary);
            text-align: center;
            white-space: nowrap;

            &::before {
                font-family: 'boxicons';
                padding-right: 0.2em;
                content: '\ea27';
            }
        }
    }
</style>