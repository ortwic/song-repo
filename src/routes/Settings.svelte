<script lang='ts'>
    import { t } from 'svelte-i18n';
    import { link } from 'svelte-spa-router';
    import TitlebarMenu from '../components/menus/TitlebarMenu.svelte';
    import Profile from '../components/settings/Profile.svelte';
    import LinkHub from '../components/settings/LinkHub.svelte';
    import Advanced from '../components/settings/Advanced.svelte';
    import GoogleDrive from '../components/settings/GoogleDrive.svelte';
    import { slideFade } from '../components/ui/helper/transition.helper';
    import Expand from '../components/ui/elements/Expand.svelte';
    import Footer from '../components/ui/Footer.svelte';
    import { authService, currentUser } from '../service/user/auth.service';
    import UserService, { isGoogleUser } from '../service/user/user.service';
    import { showError, showInfo } from '../store/notification.store';
    import '../styles/menu.scss';

    const userService = new UserService();
    let confirmDelete = $state(false);

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
    <TitlebarMenu>
        <i class="bx bx-cog"></i>&nbsp; {$t('settings.title')}
    </TitlebarMenu>
    <section>
        {#if $currentUser}
        <Expand title={$t('settings.sections.profile')}>
            <p>
                <Profile />
            </p>
        </Expand>

        <Expand title={$t('settings.sections.linkhub')}>
            <p>
                <LinkHub />
            </p>
        </Expand>
        {/if}

        {#if $isGoogleUser}
        <Expand title="Google Drive">
            <p>
                <GoogleDrive />
            </p>
        </Expand>
        {/if}

        <Expand title={$t('settings.sections.view')}>
            <p>{$t('settings.reset-text')}</p>
            <div class="right">
                <button class="default" onclick={resetViews}>{$t('settings.reset-cookies')}</button>
            </div>
        </Expand>

        {#if $currentUser}
            <Expand open={false} title={$t('settings.sections.advanced')}>
                <p>
                    <Advanced />
                </p>
            </Expand>
            
            <Expand open={false} title={$t('settings.sections.danger-zone')}>
                <div class="section danger-text">
                    <span>
                        <input id="delete" type="checkbox" bind:checked={confirmDelete} />
                        <label for="delete">{$t('settings.delete-profile')}</label>
                        ({$t('settings.data-lost')})
                    </span>
                </div>
                <div class="right">
                    <button class="primary" disabled={!confirmDelete} onclick={deleteProfile}>
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
            </Expand>
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

        Expand,
        div {
            margin: 1rem;
            text-align: left;
            border-color: var(--surface-light);

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

        .warn {
            padding: 0.4em 1em;
            border: 1px solid gray;
            background-color: var(--highlight);
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