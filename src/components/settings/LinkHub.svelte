<script lang="ts">
    import { t } from 'svelte-i18n';
    import { flip } from 'svelte/animate';
    import type { LinkPlacement, UserLink } from '../../model/user.model';
    import { UserLinkService } from '../../service/user/user-link.service';
    import { showError } from '../../store/notification.store';
    import LinkFormDialog from './LinkFormDialog.svelte';

    let {
        uid,
    }: {
        uid: string;
    } = $props();

    const linkService = $derived(new UserLinkService(uid));
    const links$ = $derived(linkService.userlinks$);

    let dialogVisible = $state(false);
    let editingLink: UserLink | null = $state(null);

    const LINK_TYPE_ICONS: Record<LinkPlacement, string> = {
        default: 'bx-link',
        donation: 'bx-coffee',
    };

    function openAddDialog() {
        editingLink = null;
        dialogVisible = true;
    }

    function openEditDialog(link: UserLink) {
        editingLink = link;
        dialogVisible = true;
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
                <div class="link-row">
                    <div class="order-controls">
                        <button class="sm clear" disabled={i === 0}
                            title={$t('settings.move-up')} onclick={() => moveLink(i, -1)}>
                            <i class="icon bx bx-chevron-up"></i>
                        </button>
                        <button class="sm clear" disabled={i === $links$.length - 1}
                            title={$t('settings.move-down')} onclick={() => moveLink(i, 1)}>
                            <i class="icon bx bx-chevron-down"></i>
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
                        <i class="bx {LINK_TYPE_ICONS[link.placement.at(-1) ?? 'default']}"></i>
                    {/if}
                </span>
                <span class="link-info">
                    <span class="link-title no-wrap" title={link.url}>{link.title}</span>
                    <span class="link-url no-wrap">{link.url}</span>
                </span>
                <div class="row-actions">
                    <button class="small clear" title={$t('settings.edit')} onclick={() => openEditDialog(link)}>
                        <i class="icon bx bx-pencil"></i>
                    </button>
                    <button class="small clear danger-text" title={$t('settings.delete')} onclick={() => deleteLink(link)}>
                        <i class="icon bx bx-trash"></i>
                    </button>
                </div>
            </div>
        </li>
    {/each}
</ul>
{:else}
    <div class="section empty-hint">
        <span>{$t('settings.linkhub.empty')}</span>
    </div>
{/if}

<div class="section" style="text-align: right;">
    <span></span>
    <button class="clear" title={$t('settings.add')} onclick={openAddDialog}>
        <i class="icon bx bx-plus"></i>
    </button>
</div>

<LinkFormDialog
    {uid}
    bind:visible={dialogVisible}
    link={editingLink}
    nextOrder={$links$?.length ?? 0}
/>

<style lang="scss">
    .link-list {
        list-style: none;
        padding: 0;
        margin: 0.5rem 0;
    }

    .link-item {
        border-bottom: 1px solid var(--surface-light);

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