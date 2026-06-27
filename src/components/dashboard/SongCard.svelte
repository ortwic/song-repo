<script lang="ts">
    import { t } from 'svelte-i18n';
    import { SEARCH_ACTIONS, SongActions } from '../../domain/song.actions';
    import { createSongEntity } from '../../domain/song.logic';
    import type { UserSong } from '../../model/song.model';
    import { type Status, STATUS_KEYS } from '../../model/types';
    import SessionService from '../../service/user/user-session.service';
    import SongService from '../../service/user/user-song.service';
    import { genreColor } from '../../styles/style.helper';
    import PopupMenu from '../ui/PopupMenu.svelte';
    import ProgressBar from '../ui/elements/ProgressBar.svelte';
    import { toDate } from '../../utils/date.helper';
    import { settings } from '../../store/user-settings.svelte';

    interface Props {
        song: UserSong;
    }

    let { song = $bindable() }: Props = $props();

    const songService = new SongService();
    const sessionService = new SessionService(songService);
    const actions = new SongActions(songService, sessionService);
    const signature = [song.key, song.time, song.bpm].filter(Boolean).join(' | ');
    const songEntity = $derived(createSongEntity(song, settings.advanced));

    let searchPopupMenu: PopupMenu = $state();
    let statusPopupMenu: PopupMenu = $state();
    let morePopupMenu: PopupMenu = $state();

    function getGenreStyles(genre: string) {
        const hex = genreColor(genre);
        const gradient = hex
            ? `radial-gradient(farthest-corner at 0% 0%, transparent 66%, ${hex})`
            : undefined;
        const genreWatermarkStyle = hex ? `color: ${hex}40;` : '';
        return { gradient, genreWatermarkStyle };
    }

    const { gradient, genreWatermarkStyle } = getGenreStyles(song.genre);

    async function handleStatusChange(status: string) {
        await actions.changeStatus(song, status as Status);
    }
</script>

<!-- Inline-Arrow onclick={() => { ... }} not working properly -->
<!-- svelte-ignore event_directive_deprecated -->
<article class="song-card" style={gradient ? `background: ${gradient};` : undefined}>
    <header title={toDate(song.changedAt).toLocaleString()}>
        <button class="lg clear" title="{$t(`songs.status.${song.status}`)}"
            onclick={(e) => statusPopupMenu.showPopupMenu(e)}>
            <span class="status {song.status}"></span>
        </button>
        <button class="lg clear" title="{$t('songs.menu.toggle-favorite')}"
            onclick={() => actions.toggleFavorite(song)}>
            <span class="fav" class:active={song.fav}></span>
        </button>
        <div class="song-info">
            <p class="artist">{song.artist ?? '—'}</p>
            <p class="title fav" class:active={song.fav}>{song.title ?? '—'}</p>
        </div>
        <button
            class="clear sm"
            title={$t('sessions.menu.quick')}
            onclick={() => sessionService.addQuick(songEntity)}
        >
            <i class="icon bx bxs-bolt"></i>
        </button>
    </header>
    <span class="genre-watermark" style={genreWatermarkStyle}>{song.genre}</span>
    <ProgressBar bind:value={song.progress} disabled={!settings.advanced.editProgressManually}></ProgressBar>

    <div class="tags">
        {#if signature}<span class="label" title="{$t('songs.columns.signature')}">{signature}</span>{/if}
        {#if song.style}<span class="label" title="{$t('songs.columns.style')}">{song.style}</span>{/if}
    </div>

    <div class="tags" title="Labels">
        {#if song.features?.length}
            {#each song.features as tag}
                <span class="label feature" class:active={tag === settings.dashboard.tag?.value}>{tag}</span>
            {/each}
        {/if}
        {#if song.tags?.length}
            {#each song.tags as tag}
                <span class="label tag" class:active={tag === settings.dashboard.tag?.value}>{tag}</span>
            {/each}
        {/if}
    </div>

    <footer>
        <button
            class="clear sm"
            title={$t('songs.menu.search')}
            onclick={(e) => searchPopupMenu.showPopupMenu(e)}
        >
            <i class="icon bx bx-search"></i>
        </button>
        <button
            class="clear sm"
            title={song.uri ? $t('songs.menu.open') : $t('songs.menu.set-resource')}
            onclick={() => actions.showResource(song)}
        >
            <i class="icon bx {song.uri ? 'bx-file' : 'bx-unlink'}"></i>
        </button>
        <button
            class="clear sm max-width"
            title={$t('sessions.menu.start')}
            onclick={() => actions.runSession(songEntity)}
        >
            <i class="icon bx bx-play"></i>
            <span class="no-wrap">{$t('sessions.menu.start')}</span>
        </button>
        <button
            class="clear sm"
            title={$t('songs.menu.more')}
            onclick={(e) => morePopupMenu.showPopupMenu(e)}
        >
            <i class="icon bx bx-dots-vertical-rounded"></i>
        </button>
    </footer>

    <PopupMenu bind:this={searchPopupMenu}>
        {#each SEARCH_ACTIONS as action}
            <button class="option" onclick={() => actions.search(song, action)}>
                <i class="bx {action.icon}"></i>
                {action.label}
            </button>
        {/each}
    </PopupMenu>

    <PopupMenu bind:this={statusPopupMenu}>
        {#each STATUS_KEYS as status}
            <button class="option"
                class:active={song.status === status}
                onclick={() => handleStatusChange(status)}
            >
                <span class="status {status}"></span>
                <span style="margin-left: 8px">
                    {$t(`songs.status.${status}`)}
                </span>
            </button>
        {/each}
    </PopupMenu>

    <PopupMenu bind:this={morePopupMenu}>
        <button class="option" title="{$t('songs.menu.edit')}"
            onclick={() => actions.editSong(song)}>
            <i class="bx bx-edit"></i>
            {$t('songs.menu.edit')}
        </button>
        <button class="option" 
            onclick={() => actions.delete(song, {
                message: $t('songs.menu.delete-confirm')
            })}>
            <i class="bx bx-trash"></i>
            {$t('songs.menu.delete')}
        </button>
    </PopupMenu>
</article>

<style lang="scss">
    .song-card {
        position: relative;
        overflow: hidden;
        background: var(--surface);
        border: 1.5px solid var(--surface-light);
        border-radius: 1rem;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 8px;
        height: 100%;
        box-sizing: border-box;
        box-shadow: var(--shadow-sm);
        transition: border-color 0.15s;

        &:hover {
            border-color: var(--border);
        }
    }

    .genre-watermark {
        position: absolute;
        bottom: 0.4em;
        left: 0.4em;
        min-width: 60%;
        text-align: center;
        font-size: 3.5rem;
        font-weight: 800;
        text-shadow: var(--shadow-sm);
        line-height: 1;
        opacity: 0.5;
        pointer-events: none;
        user-select: none;
        white-space: nowrap;
        transform: rotate(-20deg);
        transform-origin: bottom left;
    }

    header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 8px;

        button {
            padding: 6px 4px;
        }

        .song-info {
            flex: 1;
        }

        .artist {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            margin: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .title {
            font-size: 14px;
            font-weight: 500;
            margin: 2px 0 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .status {
            text-shadow: 0px 0px 2px rgba(0, 0, 0, 20%);
        }
    }

    .lg {
        font-size: 14pt;
    }

    .tags {
        display: flex;
        flex-wrap: wrap;

        .tag {
            background: var(--tag-bg);
        }

        .feature {
            background: var(--tag-hl-bg);
        }

        .active {
            border-color: var(--accent);
        }
    }

    footer {
        display: flex;
        align-items: center;
        margin-top: auto;
        padding-top: 8px;

        .max-width {
            flex: 1;
        }

        button {
            padding: 0 4px;
        }
    }

    button {
        display: flex;
        align-items: center;

        i {
            margin-right: 5px;
        }

        &.sm {
            font-size: 10pt;
        }

        &.active {
            font-weight: 600;
        }
    }
</style>