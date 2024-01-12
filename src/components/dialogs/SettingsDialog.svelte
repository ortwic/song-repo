
<script lang='ts'>
    import { t } from 'svelte-i18n';
    import ConfirmDialog from './ConfirmDialog.svelte';
    import { slideFade } from '../ui/transition.helper';
    import AuthService from '../../service/auth.service';
    import { viewStoreId } from '../../service/song.service';
    import { tableView } from "../../store/app.store";
    import { showError, showInfo } from '../../store/notification.store';

	const authService = new AuthService();
    let confirmDelete = false;
    let visible = false;
    
    export function showDialog() {
        visible = true;
    }

    function resetViews() {
        Object.keys($tableView.table?.options.persistence).forEach((key) => {
            localStorage.removeItem(`tabulator-${viewStoreId}-${key}`);
        });

        showInfo('All saved view reseted!');
    }

	async function deleteProfile({ detail: accepted }) {
        visible = false;
        if (accepted && confirmDelete) {
            try {                
                await authService.deleteUser();
                showInfo($t('settings.delete-done'));
            } catch (error) {
                showError(error.message);
            }
        }
	}
</script>

{#if visible}
<ConfirmDialog title='{ $t('settings.title') }' size='auto' target='main' on:closed={deleteProfile}>
    <section>
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
            <label class="danger" for="delete">{ $t('settings.delete-profile') }</label>
        </fieldset>
    </section>
    {#if confirmDelete}
    <div class="warn" in:slideFade={{ duration: 200 }} out:slideFade={{ duration: 200 }}>
        { $t('settings.delete-advice') }
    </div>
    {/if}
</ConfirmDialog>
{/if}

<style lang="scss">
	section {
		padding: 0 .4em;
        
        fieldset {
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
</style>