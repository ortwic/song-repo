<script lang="ts">
    import { t } from 'svelte-i18n';
    import { flip } from 'svelte/animate';
    import type { UserLink } from '../../model/user.model';
    import { UserLinkService } from '../../service/user-link.service';
    import { showError } from '../../store/notification.store';
    import { slideFade } from '../ui/transition.helper';

    const linkService = new UserLinkService();
    const links$ = linkService.userlinks;

    let addingLink = false;
    let newUrl = '';
    let newTitle = '';

    let editingId: string | null = null;
    let editUrl = '';
    let editTitle = '';

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
                    <input class="input" type="url"  placeholder="URL*" bind:value={editUrl} />
                    <input class="input" type="text" placeholder={$t('settings.linktree.title')} bind:value={editTitle} />
                    <div class="form-actions">
                        <button class="primary small" on:click={() => saveEdit(link)}>
                            <i class="bx bx-check"></i> {$t('settings.update-profile')}
                        </button>
                        <button class="default small" on:click={cancelEdit}>{$t('settings.cancel')}</button>
                    </div>
                </div>
            {:else}
                <div class="link-row">
                    <div class="order-controls">
                        <button class="default sm icon-btn" disabled={i === 0}
                            title={$t('settings.move-up')} on:click={() => moveLink(i, -1)}>
                            <i class="bx bx-chevron-up"></i>
                        </button>
                        <button class="default sm icon-btn" disabled={i === $links$.length - 1}
                            title={$t('settings.move-down')} on:click={() => moveLink(i, 1)}>
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
                    <span class="link-title" title={link.url}>{link.title}</span>
                    <span class="link-url">{link.url}</span>
                    <div class="row-actions">
                        <button class="default small icon-btn" title="{$t('settings.edit')}" on:click={() => startEdit(link)}>
                            <i class="bx bx-pencil"></i>
                        </button>
                        <button class="default small icon-btn danger-btn" title="{$t('settings.delete')}" on:click={() => deleteLink(link)}>
                            <i class="bx bx-trash"></i>
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
        <input class="input" type="url"  placeholder="URL *"    bind:value={newUrl} />
        <input class="input" type="text" placeholder={$t('settings.linktree.title')} bind:value={newTitle} />
        <div class="form-actions">
            <button class="primary" on:click={addLink} disabled={!newUrl.trim()}>
                <i class="bx bx-plus"></i> {$t('settings.add')}
            </button>
            <button class="default" on:click={() => (addingLink = false)}>{$t('settings.cancel')}</button>
        </div>
    </div>
{:else}
    <div class="section" style="text-align: right;">
        <span></span>
        <button class="default" on:click={() => (addingLink = true)}>
            <i class="bx bx-plus"></i> {$t('settings.add')}
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
        grid-template-columns: auto 1.5rem 1fr 2fr auto;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.25rem;

        .link-icon {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .link-title {
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .link-url {
            font-size: 0.8em;
            opacity: 0.6;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .row-actions {
            display: flex;
            gap: 0.25rem;
            justify-content: flex-end;
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

    .danger-btn {
        color: red;

        &:hover {
            background-color: rgba(255, 0, 0, 0.08);
        }
    }
</style>