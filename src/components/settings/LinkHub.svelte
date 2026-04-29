<script lang="ts">
    import { t } from 'svelte-i18n';
    import { flip } from 'svelte/animate';
    import type { UserLink } from '../../model/user.model';
    import { UserLinkService } from '../../service/user-link.service';
    import { showError } from '../../store/notification.store';
    import { slideFade } from '../ui/transition.helper';

    const linkService = new UserLinkService();
    const links$ = linkService.userlinks;

    let addingLink = $state(false);
    let newUrl = $state('');
    let newTitle = $state('');

    let editingId: string | null = $state(null);
    let editUrl = $state('');
    let editTitle = $state('');

    function startEdit(link: UserLink) {
        editingId = link.id;
        editUrl = link.url;
        editTitle = link.title;
    }

    function cancelEdit() {
        editingId = null;
    }

    async function saveEdit(link: UserLink) {
        if (!editUrl.trim()) return;
        try {
            await linkService.setLink({
                id: link.id,
                url: editUrl.trim(),
                title: editTitle.trim() || editUrl.trim(),
            });
            editingId = null;
        } catch (error) {
            showError(error.message);
        }
    }

    async function addLink() {
        if (!newUrl.trim()) return;
        try {
            const nextOrder = $links$?.length ?? 0;
            await linkService.addLink(
                newUrl.trim(),
                newTitle.trim() || undefined,
                nextOrder,
            );
            newUrl = '';
            newTitle = '';
            addingLink = false;
        } catch (error) {
            showError(error.message);
        }
    }

    async function deleteLink(link: UserLink) {
        try {
            await linkService.deleteLink(link);
        } catch (error) {
            showError(error.message);
        }
    }

    async function moveLink(index: number, direction: -1 | 1) {
        const links = $links$;
        const swapIndex = index + direction;
        if (swapIndex < 0 || swapIndex >= links.length) return;

        const a = links[index];
        const b = links[swapIndex];
        const orderA = a.order ?? index;
        const orderB = b.order ?? swapIndex;

        try {
            await Promise.all([
                linkService.setLink({ id: a.id, order: orderB }),
                linkService.setLink({ id: b.id, order: orderA }),
            ]);
        } catch (error) {
            showError(error.message);
        }
    }
</script>

{#if $links$?.length}
<ul class="link-list">
    {#each $links$ as link, i (link.id)}
        <li class="link-item" animate:flip={{ duration: 150 }}>
            {#if editingId === link.id}
                <div class="link-form" in:slideFade={{ duration: 150 }}>
                    <input class="input" type="text" placeholder={$t('settings.linktree.title')} bind:value={editTitle} />
                    <input class="input" type="url"  placeholder="URL*" bind:value={editUrl} />
                    <div class="form-actions">
                        <button class="small clear" onclick={() => saveEdit(link)}>
                            <i class="icon bx bx-check primary"></i> {$t('settings.update-profile')}
                        </button>
                        <button class="default small clear" onclick={cancelEdit}>
                            <i class="icon bx bx-x"></i> {$t('settings.cancel')}
                        </button>
                    </div>
                </div>
            {:else}
                <div class="link-row">
                    <div class="order-controls">
                        <button class="default sm clear" disabled={i === 0}
                            title={$t('settings.move-up')} onclick={() => moveLink(i, -1)}>
                            <i class="bx bx-chevron-up"></i>
                        </button>
                        <button class="default sm clear" disabled={i === $links$.length - 1}
                            title={$t('settings.move-down')} onclick={() => moveLink(i, 1)}>
                            <i class="bx bx-chevron-down"></i>
                        </button>
                    </div>
                    <span class="link-icon">
                        {#if link.icon}
                            {#if link.icon.startsWith('http')}
                                <img src={link.icon} alt="" width="16" height="16" />
                            {:else}
                                <i class="bx {link.icon}"></i>
                            {/if}
                        {:else}
                            <i class="bx bx-link"></i>
                        {/if}
                    </span>
                    <span class="link-info">
                        <span class="link-title no-wrap" title={link.url}>{link.title}</span>
                        <span class="link-url no-wrap">{link.url}</span>
                    </span>
                    <div class="row-actions">
                        <button class="default small clear" title="{$t('settings.edit')}" onclick={() => startEdit(link)}>
                            <i class="icon bx bx-pencil"></i>
                        </button>
                        <button class="default small clear danger-text" title="{$t('settings.delete')}" onclick={() => deleteLink(link)}>
                            <i class="icon bx bx-trash"></i>
                        </button>
                    </div>
                </div>
            {/if}
        </li>
    {/each}
</ul>
{:else}
    <div class="section empty-hint">
        <span>{$t('settings.linktree.empty')}</span>
    </div>
{/if}

{#if addingLink}
    <div class="link-form new-form" in:slideFade={{ duration: 150 }}>
        <input class="input" type="text" placeholder={$t('settings.linktree.title')} bind:value={newTitle} />
        <input class="input" type="url"  placeholder="URL *"    bind:value={newUrl} />
        <div class="form-actions">
            <button class="primary clear" onclick={addLink} disabled={!newUrl.trim()}>
                <i class="icon bx bx-plus"></i> {$t('settings.add')}
            </button>
            <button class="clear" onclick={() => (addingLink = false)}>
                <i class="icon bx bx-x"></i> {$t('settings.cancel')}
            </button>
        </div>
    </div>
{:else}
    <div class="section" style="text-align: right;">
        <span></span>
        <button class="clear" onclick={() => (addingLink = true)}>
            <i class="icon bx bx-plus"></i>
        </button>
    </div>
{/if}

<style lang="scss">
    .link-list {
        list-style: none;
        padding: 0;
        margin: 0.5rem 0;
    }

    .link-item {
        border-bottom: 1px solid var(--primghost);

        &:last-child {
            border-bottom: none;
        }
    }

    .link-row {
        display: grid;
        grid-template-columns: auto 1.5rem 1fr auto;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.25rem;

        .link-icon {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .link-info {
            display: flex;
            flex-direction: column;
            overflow: hidden;
            text-overflow: ellipsis;

            .link-title {
                font-weight: 500;
            }

            .link-url {
                font-size: 0.8em;
                opacity: 0.6;
            }
        }

        .row-actions {
            display: flex;
            flex-direction: column;
        }
    }

    .order-controls {
        display: flex;
        flex-direction: column;
        gap: 0.1rem;

        button:disabled {
            opacity: 0.2;
            cursor: default;
        }
    }

    .link-form {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        padding: 0.5rem 0.25rem;

        .form-actions {
            display: flex;
            gap: 0.5rem;
            justify-content: flex-end;
            margin-top: 0.25rem;
        }
    }

    .new-form {
        border-top: 1px dashed var(--primghost);
        margin-top: 0.5rem;
        padding-top: 0.75rem;
    }

    .empty-hint {
        opacity: 0.6;
        font-size: 0.9em;
    }

    .small {
        padding: 0.25rem 0.6rem;
        font-size: 0.85em;
    }

    .icon-btn {
        padding: 0.25rem 0.4rem;
    }
</style>