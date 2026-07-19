<script lang="ts">
    import { t } from 'svelte-i18n';
    import DialogBase from '../dialogs/DialogBase.svelte';
    import type { LinkPlacement, UserLink } from '../../model/user.model';
    import { UserLinkService } from '../../service/user/user-link.service';
    import { showError } from '../../store/notification.store';

    let {
        uid,
        link = null,
        visible = $bindable(false),
        nextOrder = 0,
        onSaved,
    }: {
        uid: string;
        link?: UserLink | null;
        visible: boolean;
        nextOrder?: number;
        onSaved?: () => void;
    } = $props();

    const linkService = $derived(new UserLinkService(uid));
    const isEdit = $derived(!!link);

    let title = $state('');
    let url = $state('');
    let placement = $state<LinkPlacement[]>(['default']);

    const showOnUserpage = $derived(placement.includes('default'));
    const isDonation = $derived(placement.includes('donation'));

    $effect(() => {
        if (visible) {
            title = link?.title ?? '';
            url = link?.url ?? '';
            placement = link?.placement ?? ['default'];
        }
    });

    function togglePlacement(value: LinkPlacement, checked: boolean) {
        if (checked) {
            if (!placement.includes(value)) {
                placement = [...placement, value];
            }
        } else {
            placement = placement.filter((p) => p !== value);
        }
    }

    async function done(confirmed: boolean) {
        if (confirmed && url.trim()) {
            try {
                if (isEdit && link) {
                    await linkService.setLink({
                        id: link.id,
                        url: url.trim(),
                        title: title.trim() || url.trim(),
                        placement,
                    });
                } else {
                    await linkService.addLink({
                        url: url.trim(),
                        title: title.trim() || undefined,
                        order: nextOrder,
                        placement,
                    });
                }
                onSaved?.();
                visible = false;
            } catch (error) {
                showError(error.message);
            }
        } else {
            visible = confirmed;
        }
    }
</script>

<DialogBase size="auto" type="confirm" {visible} onClose={({ action }) => done(action === 'confirm')}>
    {#snippet header()}
        <i class="bx {isEdit ? 'bx-pencil' : 'bx-plus'}"></i>
        {$t(isEdit ? 'settings.edit' : 'settings.add')}
    {/snippet}

    <div class="body">
        <div class="field">
            <input class="input" type="text" placeholder={$t('settings.linkhub.title')} bind:value={title} />
        </div>
        <div class="field">
            <input class="input" type="url" placeholder="URL *" bind:value={url} />
        </div>
        <div class="field">
            <span class="field-label">{$t('settings.linkhub.placement')}</span>
            <label class="checkbox-label">
                <input
                    type="checkbox"
                    checked={showOnUserpage}
                    onchange={(e) => togglePlacement('default', e.currentTarget.checked)}
                />
                {$t('settings.linkhub.placement-userpage')}
            </label>
            <label class="checkbox-label">
                <input
                    type="checkbox"
                    checked={isDonation}
                    onchange={(e) => togglePlacement('donation', e.currentTarget.checked)}
                />
                {$t('settings.linkhub.placement-donation')}
            </label>
        </div>
    </div>
</DialogBase>

<style lang="scss">
    .body {
        display: flex;
        flex-direction: column;
        gap: 1em;
        padding: 1em;
        min-width: 20rem;
    }

    .field {
        display: flex;
        flex-direction: column;
    }

    .field-label {
        font-size: 0.85em;
        opacity: 0.8;
        margin-bottom: 0.2rem;
    }

    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
</style>
