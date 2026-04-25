<script lang="ts">
    import Color from 'color';
    import type { UserSong } from '../../model/song.model';
    import { toDate } from '../table/templates/Formatter.class';
    import { genreColor } from '../../styles/style.helper';

    export let song: UserSong;

    const asArray = <T>(obj: T) => Array.isArray(obj) ? obj : [obj];
    const { gradient, genreLabelStyle } = getGenreStyles(song.genre);
    const meta = [song.key, song.time, song.bpm].filter(Boolean).join(' | ');
    const labels = [
        ...asArray(song.tags), 
        ...asArray(song.features),
    ].filter(Boolean);

    function getGenreStyles(genre: string) {
        const hex = genreColor(genre);
        const gradient = hex
            ? `radial-gradient(farthest-corner at 0% 0%, transparent 66%, ${hex})`
            : undefined;
        const genreObj = hex ? Color(hex) : undefined;
        const genreLabelStyle = genreObj
            ? `background: ${hex}; color: ${genreObj.isDark() ? 'white' : 'black'};`
            : '';
        return { gradient, genreLabelStyle };
    }
</script>

<article
    class="song-card"
    style={gradient ? `background: ${gradient};` : undefined}
>
    <header title="{toDate(song.changedAt).toLocaleString()}">
        <div class="song-info">
            <p class="artist">{song.artist ?? '—'}</p>
            <p class="title">{song.title ?? '—'}</p>
        </div>
        <div class="status {song.status}" title="{song.status}"></div>
    </header>

    <div>
        <progress-bar value="{song.progress ?? 0}" max="100" min="0"></progress-bar>
    </div>

    <div class="tags">
        {#if song.genre}
            <span class="label genre" style={genreLabelStyle}>{song.genre}</span>
        {/if}
        {#if song.style}<span class="label">{song.style}</span>{/if}
        {#if meta}<span class="label">{meta}</span>{/if}
    </div>

    {#if labels.length}
        <div class="tags">
            {#each labels as tag}
                <span class="label tag">{tag}</span>
            {/each}
        </div>
    {/if}
</article>

<style lang="scss">
    .song-card {
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

    header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 8px;
    }

    .song-info {
        min-width: 0;
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

    .tags {
        display: flex;
        flex-wrap: wrap;
    }
</style>