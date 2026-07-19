<script lang="ts">
    import { t } from 'svelte-i18n';
    import type { Subscription } from 'rxjs';
    import type { UserSong } from '../../model/song.model';
    import type { SongRequestViewGroup } from '../../model/song-request.model';
    import SongRequestService from '../../service/user/song-requests.service';
    import SongService from '../../service/user/user-song.service';
    import { initBrowserNotification } from '../../utils/browser-notification';
    import { toDate } from '../../utils/date.helper';
    import { createDeferred, type DeferredResult } from '../../utils/promise.helper';
    import { registerDialog } from '../dialog-context.svelte';
    import DialogBase from './DialogBase.svelte';

    const songService = new SongService();
    const requestService = new SongRequestService(songService);
    
    let visible = $state(false);
    let items = $state<SongRequestViewGroup[]>([]);
    let notifier: ReturnType<typeof initBrowserNotification>;
    let subscriptions: Subscription[] = [];
    let result: DeferredResult<void> | undefined;

    registerDialog('LiveSessionDialog', showDialog);

    export function showDialog(): Promise<void> {
        const formatNotification = (song: UserSong) => ({
            title: $t('sessions.requests.title'),
            message: song ? `${song.artist} – ${song.title}` : $t('sessions.requests.unknown-song')
        });
        
        visible = true;
        notifier = initBrowserNotification('/logo.svg');

        let knownIds = new Set<string>();

        subscriptions = [
            requestService.pendingRequestsAsGroup().subscribe((groups) => items = groups),
            requestService.requests$.subscribe((requests) => {
                const openRequests = requests.filter((r) => r.status === 'open');
                
                const newIds = openRequests.map(r => r.id).filter(id => !knownIds.has(id));
                if (newIds.length > 0) {
                    notifier.send(openRequests, ({ song }) => formatNotification(song));
                }

                knownIds = new Set(openRequests.map(r => r.id));
                requestService.markSeen(openRequests.map((r) => r.id));
            })  
        ];

        result = createDeferred<void>();
        return result.promise;
    }

    async function handleMarkDone(view: SongRequestViewGroup): Promise<void> {
        await requestService.markDone(view.requestIds);
    }

    function close(): void {
        notifier.dispose();
        subscriptions.forEach(s => s.unsubscribe());
        visible = false;
        result?.resolve();
    }
</script>

<DialogBase {visible} size="auto" type="confirm" onClose={() => close()}>
    {#snippet header()}
        <span class="no-wrap">
            <i class="bx bx-microphone"></i>
            {$t('sessions.requests.title')}
        </span>
    {/snippet}

    <div class="dialog-body">
        {#if items.length === 0}
            <p class="empty">{$t('sessions.requests.empty')}</p>
        {:else}
            <ul class="request-list">
                {#each items as item (item.songId)}
                    <li class="request-item">
                        <span class="song">
                            {#if item.song}
                                <span class="artist">{item.song.artist}</span>
                                <span class="title">{item.song.title}</span>
                            {:else}
                                <span class="title muted">{$t('sessions.requests.unknown-song')}</span>
                            {/if}
                        </span>
                        {#if item.count > 1}
                            <span class="count-badge" title={$t('sessions.requests.count', { values: { count: item.count } })}>
                                ({item.count})
                            </span>
                        {/if}
                        <span class="meta">{toDate(item.latestCreatedAt).toRelative()}</span>
                        <button class="clear" title={$t('sessions.requests.mark-done')}
                            onclick={() => handleMarkDone(item)}>
                            <i class="bx bx-check-circle"></i>
                        </button>
                    </li>
                {/each}
            </ul>
        {/if}
    </div>
</DialogBase>

<style lang="scss">
    .dialog-body {
        gap: 1rem;
        min-width: 20rem;
    }

    .request-list {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .request-item {
        display: flex;
        align-items: center;
        gap: .6em;
        padding: .4em 0;
 
        .count-badge {
            font-weight: 600;
            color: var(--text-muted);
            padding: 0 .3em;
        }

        .song {
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        .meta {
            font-size: 12px;
            color: var(--text-muted);
        }
    }

    .empty {
        font-size: 14px;
        color: var(--text-muted);
        text-align: center;
    }
</style>