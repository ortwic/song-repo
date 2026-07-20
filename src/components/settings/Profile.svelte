<script lang='ts'>
    import { nanoid } from 'nanoid';
    import { t } from 'svelte-i18n';
    import { Subject, of, switchMap, debounceTime, distinctUntilChanged } from 'rxjs';
    import UserService from '../../service/user/user.service';
    import { showError, showInfo } from '../../store/notification.store';
    import { currentProfile } from '../../store/profile.store';
    import { generateAvatarUrl } from '../../utils/avatar.helper';

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

    let uid = $state('');
    let name = $state('');
    let photoUrl = $state('');
    let alias = $state('');
    let about = $state('');
    const generated = $derived(photoUrl?.startsWith('data:image'));

    currentProfile.subscribe((p) => {
        uid = p.id ?? '';
        name  = p.name  ?? '';
        photoUrl = p.photoURL ?? '';
        alias = p.alias ?? '';
        about = p.about ?? '';
    });

    $effect(() => {
        aliasInput$.next(alias);
    });
    let aliasChanged = $derived(alias !== ($currentProfile.alias ?? ''));
    let dirty = $derived(name  !== ($currentProfile.name  ?? '')
            || alias !== ($currentProfile.alias ?? '')
            || photoUrl !== ($currentProfile.photoURL ?? '')
            || about !== ($currentProfile.about ?? ''));
    let canSave = $derived(uid && dirty && (aliasChanged ? $aliasStatus$ === true : true));

    function generateRandomAvatar() {
        photoUrl = generateAvatarUrl(name || alias, nanoid(6));
    }

    function removePhoto() {
        photoUrl = '';
    }

    async function saveProfile() {
        if (canSave) {
            try {
                await userService.updateProfile({
                    id: uid,
                    name,
                    photoURL: photoUrl,
                    alias,
                    about,
                });
                showInfo($t('settings.profile-updated'));
            } catch (error) {
                showError(error.message);
            }
        }
    }
</script>

<div class="section grid-max-2">
    <label for="name">Name</label>
    <input id="name" type="text" class="input lg" bind:value={name} />

    <label for="photoUrl">Photo URL</label>
    <div class="photo-wrap">
        {#if photoUrl}
            <img class="avatar-preview" src={photoUrl} alt="" />
        {:else}
            <span class="avatar-preview na">n/a</span>
        {/if}
        <input id="photoUrl" type="url" class="input lg" bind:value={photoUrl} disabled={generated} />
        <span class="icon-overlay">
            {#if photoUrl}
            <button class="clear" title={$t('settings.remove')} onclick={removePhoto}>✕</button>
            {:else}
            <button class="clear" title={$t('settings.generate-avatar')} onclick={generateRandomAvatar}>✧</button>
            {/if}
        </span>
    </div>

    <label for="alias">Alias</label>
    <div class="alias-wrap">
        <div class="input-wrap">
            <span class="alias-prefix">@</span>
            <input id="alias" type="text" class="input lg"
                class:is-valid={aliasChanged && $aliasStatus$ === true}
                class:is-invalid={aliasChanged && $aliasStatus$ === false}
                bind:value={alias}
                placeholder={$t('settings.alias')} />
        </div>
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
    <button class="primary clear" disabled={!canSave} onclick={saveProfile}>
        <i class="bx bx-check-circle"></i>
        {$t('settings.update-profile')}
    </button>
</p>

<style lang="scss">
    input {
        width: calc(100% - 1em);
    }

    .photo-wrap {
        position: relative;
        width: 100%;

        input {
            width: calc(100% - 4.6em);
            padding-left: 2.4em;
            padding-right: 2em;

            &:disabled {
                color: var(--text-muted);
            }
        }
    }

    .avatar-preview {
        position: absolute;
        left: 0.5em;
        top: 50%;
        transform: translateY(-50%);
        width: 1.6em;
        height: 1.6em;
        border-radius: 50%;
        object-fit: cover;
        pointer-events: none;

        &.na {
            color: var(--text-muted);
            background-color: var(--surface);
            font-size: 0.75em;
            letter-spacing: -0.04em;
            padding: 0.4em;
        }
    }

    .icon-overlay {
        position: absolute;
        right: 0.6em;
        top: 50%;
        transform: translateY(-50%);

        button {
            opacity: 0.55;
            transition: opacity 0.15s;
            padding: 0.2em;
            line-height: 1;

            &:hover {
                opacity: 1;
            }
        }
    }

    .alias-wrap {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
    }

    .input-wrap {
        position: relative;
        width: 100%;

        input {
            width: calc(100% - 1em - 1.2em);
            padding-left: 1.6em;
        }

        .alias-prefix {
            position: absolute;
            left: 0.5em;
            top: 50%;
            transform: translateY(-50%);
            opacity: 0.55;
            pointer-events: none;
        }
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