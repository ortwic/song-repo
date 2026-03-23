<script lang='ts'>
    import { t } from 'svelte-i18n';
    import { Subject, of, switchMap, debounceTime, distinctUntilChanged } from 'rxjs';
    import { currentUser } from '../../service/auth.service';
    import UserService, { currentProfile } from '../../service/user.service';
    import { showError, showInfo } from '../../store/notification.store';

    const userService = new UserService();
    const aliasInput$ = new Subject<string>();
    const aliasStatus$ = aliasInput$.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(value => {
            if (!value || value === $currentProfile.alias) return of(null);
            return userService.isAliasAvailable(value);
        })
    );

    let name = '';
    let photoUrl = '';
    let alias = '';
    let about = '';

    currentProfile.subscribe((p) => {
        name  = p.name  ?? '';
        photoUrl = p.photoURL ?? '';
        alias = p.alias ?? '';
        about = p.about ?? '';
    });

    $: aliasInput$.next(alias);
    $: aliasChanged = alias !== ($currentProfile.alias ?? '');
    $: dirty = name  !== ($currentProfile.name  ?? '')
            || aliasChanged
            || about !== ($currentProfile.about ?? '');
    $: canSave = dirty && (aliasChanged ? $aliasStatus$ === true : true);

    async function saveProfile() {
        if (!canSave) return;
        try {
            await userService.updateProfile({
                id: $currentUser.uid,
                name,
                about,
            });
            if (aliasChanged) {
                await userService.setAlias($currentUser.uid, alias);
            }
            showInfo($t('settings.profile-updated'));
        } catch (error) {
            showError(error.message);
        }
    }
</script>

<div class="section grid">
    <label for="name">Name</label>
    <input id="name" type="text" class="input lg" bind:value={name} />

    <label for="photoUrl">Photo</label>
    <input id="photoUrl" type="url" class="input lg" bind:value={photoUrl} />

    <label for="alias">Alias</label>
    <div class="alias-wrap">
        <input id="alias" type="text" class="input lg"
            class:is-valid={aliasChanged && $aliasStatus$ === true}
            class:is-invalid={aliasChanged && $aliasStatus$ === false}
            bind:value={alias}
            placeholder={$t('settings.alias')} />
        {#if aliasChanged}
            {#if $aliasStatus$ === null}
                <span class="alias-hint checking">
                    <i class="bx bx-loader-alt bx-spin"></i>
                </span>
            {:else if $aliasStatus$ === true}
                <span class="alias-hint valid">
                    <i class="bx bx-check"></i> {$t('settings.alias-available')}
                </span>
            {:else if $aliasStatus$ === false}
                <span class="alias-hint invalid">
                    <i class="bx bx-x"></i> {$t('settings.alias-exists')}
                </span>
            {/if}
        {/if}
    </div>

    <label for="about">{$t('settings.about')}</label>
    <textarea id="about" class="input" bind:value={about} rows="6"></textarea>
</div>

<p style="text-align: right;">
    <button class="primary" disabled={!canSave} on:click={saveProfile}>
        {$t('settings.update-profile')}
    </button>
</p>

<style lang="scss">
    input {
        width: calc(100% - 1em);
    }

    .grid {
        display: grid;
        grid-template-columns: auto 1fr;
        grid-gap: 1rem;
    }

    .alias-wrap {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
    }

    .alias-hint {
        font-size: 0.8em;
        display: flex;
        align-items: center;
        gap: 0.2em;
    }

    .valid    { color: var(--success, green); }
    .invalid  { color: var(--danger,  red);   }
    .checking { opacity: 0.6; }

    input.is-valid   { border-color: var(--success, green); }
    input.is-invalid { border-color: var(--danger,  red);   }
</style>