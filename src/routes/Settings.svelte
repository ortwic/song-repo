
<script lang='ts'>
    import { t } from 'svelte-i18n';
    import { push } from 'svelte-spa-router';
    import Titlebar from '../components/ui/elements/Titlebar.svelte';
    import { slideFade } from '../components/ui/transition.helper';
    import AuthService, { currentUser } from '../service/auth.service';
    import { createUserStore, viewStoreId } from '../service/song.service';
    import { currentMenu, tableView } from "../store/app.store";
    import { showError, showInfo } from '../store/notification.store';

	const authService = new AuthService();
    let confirmDelete = false;
    
    async function signOut(): Promise<void> {
		await authService.signOut();
        currentMenu.set('main');
        push('/');
	}
    
    function resetViews() {
        Object.keys($tableView.table?.options.persistence).forEach((key) => {
            localStorage.removeItem(`tabulator-${viewStoreId}-${key}`);
        });

        showInfo($t('settings.reset-done'));
    }

	async function deleteProfile() {
        try {
            // #43 workaround as deleting user data requires delete-user-data extension
            const store = createUserStore();
            await store.setDeletedFlag($currentUser.uid);
            await authService.deleteUser();
            showInfo($t('settings.delete-done'));
        } catch (error) {
            showError(error.message);
        }
    }
</script>

<main class="content">
    <Titlebar closable={false}>
        <i class="bx bx-cog"></i>&nbsp; { $t('settings.title')}
    </Titlebar>
    <div>
        <div>
            <button class="primary" title="{ $t('profile.sign-out') }" on:click={signOut}>
                <i class='bx bx-log-out-circle'></i>
                { $t('profile.sign-out') }
            </button>
        </div>
        <fieldset>
            <legend>{ $t('settings.view') }</legend>
            <p>
                { $t('settings.reset-text') }
            </p>
            <div class="right">
                <button class="default" on:click={resetViews}>{ $t('settings.reset-views') }</button>
            </div>
        </fieldset>
        <fieldset>
            <legend>{ $t('settings.profile') }</legend>
            <input id="delete" type="checkbox" bind:checked={confirmDelete} /> 
            <label class="danger" for="delete">{ $t('settings.delete-profile') }</label> ({ $t('settings.data-lost') })
            <div class="right">
                <button class="primary" disabled={!confirmDelete} on:click={deleteProfile}>
                    { $t('settings.delete-profile') }
                </button>
            </div>
            {#if confirmDelete}
            <br>
            <div class="warn" in:slideFade={{ duration: 200 }} out:slideFade={{ duration: 200 }}>
                { $t('settings.delete-advice') }
            </div>
            {/if}
        </fieldset>
    </div>
</main>

<style lang="scss">
	main > div {
        padding: 1em 5%;
        max-width: 40em;
        
        fieldset, div {
		    margin: 1rem;
            text-align: left;
            border-color: var(--primghost);

            legend, p {
                padding: 0 .4rem;
            }

            label {
                display: inline;
            }
        }

        .danger {
            color: red;
            font-weight: 500;
            text-shadow: 1px 1px 1px gray;
        }

        .warn {
            padding: .4em 1em;
            border: 1px solid gray;
            background-color: var(--secondary);
            text-align: center;
            white-space: nowrap;

            &::before {
                font-family: 'boxicons';
                padding-right: .2em;
                content: '\ea27';
            }
        }
	}
</style>