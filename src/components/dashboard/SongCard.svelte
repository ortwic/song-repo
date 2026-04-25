<script lang="ts">
    import { t } from 'svelte-i18n';
    import type { UserSong } from '../../model/song.model';
    import { type Status, status as statusKeys } from '../../model/types';
    import { toDate } from '../table/templates/Formatter.class';
    import { genreColor } from '../../styles/style.helper';
    import type SongService from '../../service/user-song.service';
    import { SEARCH_ACTIONS, SongActions } from '../table/SongActions.class';
    import { getContext } from 'svelte';
    import type { Dialog } from '../../model/dialog.model';
    import PopupMenu from '../ui/PopupMenu.svelte';

    export let song: UserSong;
    export let service: SongService;

    const actions = new SongActions(service);
    const prompt = getContext<Dialog<string>>('resource-prompt');

    const asArray = <T,>(obj: T) => (Array.isArray(obj) ? obj : [obj]);
    const signature = [song.key, song.time, song.bpm].filter(Boolean).join(' | ');

    let searchPopupMenu: PopupMenu;
    let statusPopupMenu: PopupMenu;

    function getGenreStyles(genre: string) {
        const hex = genreColor(genre);
        const gradient = hex
            ? `radial-gradient(farthest-corner at 0% 0%, transparent 66%, ${hex})`
            : undefined;
        const genreWatermarkStyle = hex ? `color: ${hex}40;` : '';
        return { gradient, genreWatermarkStyle };
    }

    const { gradient, genreWatermarkStyle } = getGenreStyles(song.genre);

    function handlePrimary() {
        if (song.uri) {
            actions.openUri(song);
        } else {
            const unsub = prompt.showDialog('').subscribe(async (result) => {
                if (result) {
                    await actions.setUri(song, result);
                    song = { ...song, uri: result };
                }
                unsub();
            });
        }
    }

    async function handleProgressChange(e: CustomEvent<number[]>) {
        const [newValue, oldValue] = e.detail;
        const newStatus = await actions.updateProgress(song, newValue, oldValue);
        if (newStatus) {
            song = { ...song, progress: newValue, status: newStatus };
        } else {
            song = { ...song, progress: newValue };
        }
    }

    async function handleStatusChange(status: string) {
        await actions.changeStatus(song, status as Status);
        song = { ...song, status: status as Status };
    }
</script>

<article class="song-card" style={gradient ? `background: ${gradient};` : undefined}>
    <header title={toDate(song.changedAt).toLocaleString()}>
        <button class="lg clear" on:click|stopPropagation={(e) => statusPopupMenu.showPopupMenu(e)}>
            <span class="status {song.status}" title={$t(`songs.status.${song.status}`)}></span>
        </button>
        <button class="lg clear" on:click|stopPropagation={() => actions.toggleFavorite(song)}>
            <span class="fav" class:active={song.fav}></span>
        </button>
        <div class="song-info">
            <p class="artist">{song.artist ?? '—'}</p>
            <p class="title fav" class:active={song.fav}>{song.title ?? '—'}</p>
        </div>
    </header>
    <span class="genre-watermark" style={genreWatermarkStyle}>{song.genre}</span>
    <div>
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <progress-bar
            value="{song.progress ?? 0}"
            max="100"
            min="0"
            on:change={handleProgressChange}
        ></progress-bar>
    </div>

    <div class="tags">
        {#if signature}<span class="label" title="{$t('songs.columns.signature')}">{signature}</span>{/if}
        {#if song.style}<span class="label" title="{$t('songs.columns.style')}">{song.style}</span>{/if}
    </div>

    <div class="tags" title="Labels">
        {#if song.tags?.length}
            {#each asArray(song.tags).filter(Boolean) as tag}
                <span class="label tag">{tag}</span>
            {/each}
        {/if}
        {#if song.features?.length}
            {#each asArray(song.features).filter(Boolean) as tag}
                <span class="label feature">{tag}</span>
            {/each}
        {/if}
    </div>

    <footer>
        <button
            class="clear sm"
            title={$t('songs.menu.search')}
            on:click|stopPropagation={(e) => searchPopupMenu.showPopupMenu(e)}
        >
            <i class="icon bx bx-search"></i>
        </button>
        <button
            class="clear sm max-width"
            title={song.uri ? $t('songs.menu.open') : $t('songs.menu.change-resource')}
            on:click|stopPropagation={handlePrimary}
        >
            <i class="icon bx {song.uri ? 'bx-link-external' : 'bx-unlink'}"></i>
            {song.uri ? $t('songs.menu.open') : $t('songs.menu.set-resource')}
        </button>
    </footer>

    <PopupMenu bind:this={searchPopupMenu}>
        {#each SEARCH_ACTIONS as action}
            <button class="empty no-wrap" on:click={() => actions.search(song, action)}>
                <i class="bx {action.icon}"></i>
                {action.label}
            </button>
        {/each}
    </PopupMenu>

    <PopupMenu bind:this={statusPopupMenu}>
        {#each Object.keys(statusKeys) as s}
            <button class="empty no-wrap"
                class:active={song.status === s}
                on:click={() => handleStatusChange(s)}
            >
                <span class="status {s}"></span>
                <span style="margin-left: 8px">
                    {$t(`songs.status.${s}`)}
                </span>
            </button>
        {/each}
    </PopupMenu>
</article>

<style lang="scss">
    .song-card {
        position: relative;
        overflow: hidden;
        background: var(--primback);
        border: 1.5px solid var(--primghost);
        border-radius: 1rem;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 8px;
        height: 100%;
        box-sizing: border-box;
        box-shadow: 1px 1px 4px #80808060;
        transition: border-color 0.15s;

        &:hover {
            border-color: silver;
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
        text-shadow: 1px 1px 4px #80808040;
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
            background: ivory;
        }

        .feature {
            background: lavender;
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