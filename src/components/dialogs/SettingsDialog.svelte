
<script lang='ts'>
    import { t } from 'svelte-i18n';
    import ConfirmDialog from './ConfirmDialog.svelte';
    import { slideFade } from '../ui/transition.helper';
    import AuthService from '../../service/auth.service';
    import { showError, showInfo } from '../../store/notification.store';

	const authService = new AuthService();
    let confirmDelete = false;
    let visible = false;
    
    export function showDialog() {
        visible = true;
    }

	async function deleteProfile({ detail: accepted }) {
        visible = false;
        if (accepted && confirmDelete) {
            try {                
                // await authService.deleteUser();
                showInfo($t('profile.delete-done'));
            } catch (error) {
                showError(error.message);
            }
        }
	}
</script>

{#if visible}
<ConfirmDialog title='{ $t('profile.settings') }' size='auto' target='main' on:closed={deleteProfile}>
    <div class="dialog section">
        <div class="row">
            <input id="delete" type="checkbox" bind:checked={confirmDelete} /> 
            <label class="danger" for="delete">{ $t('profile.delete-profile') }</label>
        </div>
    </div>
    {#if confirmDelete}
    <div class="warn" in:slideFade={{ duration: 200 }} out:slideFade={{ duration: 200 }}>
        { $t('profile.delete-advice') }
    </div>
    {/if}
</ConfirmDialog>
{/if}

<style lang="scss">
	.dialog {
		padding: 0 2rem;
        
        .row {
		    padding: 1rem 2rem;
        }
	}

    .danger {
        color: red;
        font-weight: 500;
    }

    .warn {
        padding: .4em 1em;
        border: 1px solid gray;
        background-color: goldenrod;
        text-align: center;
        white-space: nowrap;

        &::before {
            font-family: 'boxicons';
            padding-right: .2em;
            content: '\ea27';
        }
    }
</style>