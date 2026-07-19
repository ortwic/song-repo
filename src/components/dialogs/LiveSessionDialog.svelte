<script lang="ts">
    import { t } from 'svelte-i18n';
    import { combineLatest, type Subscription } from 'rxjs';
    import { groupSongRequests, type SongRequestView } from '../../domain/song-request.view';
    import SongRequestService from '../../service/user/song-requests.service';
    import SongService from '../../service/user/user-song.service';
    import { toDate } from '../../utils/date.helper';
    import { createDeferred, type DeferredResult } from '../../utils/promise.helper';
    import { registerDialog } from '../dialog-context.svelte';
    import DialogBase from './DialogBase.svelte';

    const requestService = new SongRequestService();
    const songService = new SongService();

    let visible = $state(false);
    let items = $state<SongRequestView[]>([]);
    let subscription: Subscription | undefined;
    let result: DeferredResult<void> | undefined;

    registerDialog('LiveSessionDialog', showDialog);

    export function showDialog(): Promise<void> {
        visible = true;
        subscription = combineLatest([requestService.requests$, songService.usersongs$]).subscribe(
            ([requests, songs]) => {
                items = groupSongRequests(
                    requests.filter((r) => r.status === 'open'),
                    songs
                );
            }
        );
        result = createDeferred<void>();
        return result.promise;
    }

    async function handleMarkDone(view: SongRequestView): Promise<void> {
        await requestService.markDone(view.requestIds);
    }

    function close(): void {
        subscription?.unsubscribe();
        subscription = undefined;
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