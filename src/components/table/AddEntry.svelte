<script lang="ts">
    import '../../styles/search.scss';
    import { onMount } from "svelte";
    import AddButton from "../ui/AddButton.svelte";
    import ConfirmDialog from "../ui/ConfirmDialog.svelte";
    import Image from "../ui/elements/Image.svelte";
    import SearchInput from "../ui/SearchInput.svelte";
    import SongService from "../../service/song.service";
    import SearchService, { create } from "../../service/search.service";
    import type { UserSong } from "../../model/song.model";
    import { showError } from "../../store/notification.store";
    import type { ArtistResult, SongResult } from "../../model/songbpm.model";
    
    const required = true;
    const songService = new SongService();
    let searchService: SearchService;
    let form: HTMLFormElement;
    let visible = false;

    let newSong: Partial<UserSong>;
    let label = '';

    reset();
    onMount(async () => searchService = await create());
    
    async function done({ detail: confirm }): Promise<void> {
        if (!confirm) {
            reset();
        } else if (form.checkValidity()) {
            if (label) {
                newSong.tags.push(label);
            }
            await songService.addSong(newSong);

            reset();
        }
    }

    function reset(): void {
        newSong = { features: [], tags: [] };
        visible = false;
    }

    function addLabel(ev: KeyboardEvent) {
        if(ev.key === ',') {
            ev.preventDefault();
            newSong.tags = [ ...newSong.tags, label ];
            label = '';
        }
    }

    function setArtist(artist?: ArtistResult) {
        newSong.artist = artist?.name;
        newSong.artistImg = artist?.img;
        if (artist?.genres?.length) {
            newSong.genre = artist.genres[0];
            if (newSong.genre?.length > 1) {
                newSong.style = artist.genres.slice(1).join(', ');
            }
        } else {
            newSong.genre = undefined;
            newSong.style = undefined;
        }
        if (artist?.from) {
            newSong.features?.push(artist.from)
        }
    }

    function setSong(song?: SongResult) {
        newSong.title = song?.title;
        newSong.bpm = song?.tempo;
        newSong.key = song?.key_of;
        newSong.time = song?.time_sig;
        if (song?.album?.title && song?.album?.uri) {            
            newSong.source = `[${song.album.title}](${song.album.uri})`;
        }

        if (!newSong.artist) {
            setArtist(song?.artist);
        }
    }

</script>

{#if !songService.isShared()}
<AddButton title="add song" on:click={() => visible = true}/>
{/if}

{#if visible}
<form bind:this={form} on:submit|preventDefault>
    <ConfirmDialog size='full' on:closed={done}>
        <div class="title" slot="title">
            Search - powered by <a href="https://getsongbpm.com/api" target="_blank">GetSongbpm</a>
        </div>
        <section>
            <div class="section flex">
                <div>
                    <label for="artist">Artist</label>
                    <SearchInput id="artist" placeholder="artist" value={newSong.artist ?? ''} 
                        {required} debounceMs={500} minChars={2}
                        let:results request={(value) => searchService.findArtists(value)} 
                        on:clear={() => setArtist()} on:error={({ detail }) => showError(detail)}>
                        
                        {#each results ?? [] as item}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <div class="option" on:click={() => setArtist(item)}>
                            <Image src={item.img} />
                            <div>
                                <a title="Artist" href={item.uri} target="_blank">{item.name}</a>
                                <span title="Country">{item.from ?? ''}</span>
                                <br>
                                {#each item.genres ?? [] as genre}
                                <span class='label'>{genre}</span>
                                {/each}
                            </div>
                        </div>
                        {/each}
                    </SearchInput>
                </div>
                <div>
                    <label for="title">Title</label>
                    <SearchInput id="title" placeholder="title" value={newSong.title ?? ''} 
                        {required} debounceMs={newSong.artist ? 500 : 990} minChars={newSong.artist ? 0 : 3}
                        let:results request={(value) => searchService.findSongs(value, newSong.artist)} 
                        on:clear={() => setSong()} on:error={({ detail }) => showError(detail)}>

                        {#each results ?? [] as item}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <div class="option" on:click={() => setSong(item)}>
                            <a title={item.album?.title} href={item.album?.uri ?? item.artist?.uri} target="_blank">
                                <Image src={item.album?.img ?? item.artist?.img} />
                            </a>
                            <div>
                                <a title="Title" href={item.uri} target="_blank">{item.title}</a>
                                {#if newSong.artist}
                                <span title="Year">({item.album?.year})</span>
                                <br>
                                <span title="Tempo" class='label'>{item.tempo}</span>
                                <span title="Time" class='label'>{item.time_sig}</span>
                                <span title="Key" class='label'>{item.key_of}</span>
                                {:else}
                                <br>
                                <a title="Artist" href={item.artist?.uri} target="_blank">{item.artist?.name}</a>
                                <br>
                                    {#each item.artist?.genres ?? [] as genre}
                                    <span class='label'>{genre}</span>
                                    {/each}
                                {/if}
                            </div>
                        </div>
                        {/each}
                    </SearchInput>
                </div>
                <div>
                    <label for="genre">Genre</label>
                    <input id="genre" class="lg" type="text" placeholder="genre" autocapitalize="words" bind:value={newSong.genre}>
                </div>
                <div>
                    <label for="style">Styles</label>
                    <input id="style" class="lg" type="text" placeholder="style" autocapitalize="words" bind:value={newSong.style} on:keydown={addLabel}>
                </div>
                <div>
                    <label for="source" title="markdown supported e.g. [link](http://example.com)">Source <i class='bx bx-help-circle'></i></label>
                    <input id="source" class="lg" type="text" placeholder="source" bind:value={newSong.source}>
                </div>
                <div>
                    <label for="tags" title="comma separated e.g. Foo, Bar">Labels <i class='bx bx-help-circle'></i></label>
                    <input id="tags" class="lg" type="text" placeholder="tags" bind:value={label} on:keydown={addLabel}>
                    <div class="flex labels">
                        {#each newSong.tags as tag}
                        <span class='label'>{tag}</span>
                        {/each}
                    </div>
                </div>
                <div>
                    <label for="difficulty">Difficulty</label>
                    <input id="difficulty" class="sm" type="number" min="1" max="10" bind:value={newSong.difficulty} on:keydown={addLabel}>
                    <label for="bpm">Tempo</label>
                    <input id="bpm" class="sm" type="text" placeholder="120" bind:value={newSong.bpm} on:keydown={addLabel}>
                    <label for="time">Time</label>
                    <input id="time" class="sm" type="text" placeholder="4/4" bind:value={newSong.time} on:keydown={addLabel}>
                    <label for="key">Key</label>
                    <input id="key" class="sm" type="text" placeholder="C" bind:value={newSong.key} on:keydown={addLabel}>
                </div>
            </div>
        </section>
        {#if !songService.hasUser()}
        <div class='warn'>You are not signed in, so data won't be persisted after leaving the app!</div>
        {/if}
    </ConfirmDialog>
</form>
{/if}

<style lang="scss">
@use "../../styles/search.scss";
form {
    text-align: left;

    div.title a {
        color: var(--primback);
        text-decoration: underline;

        &:hover {
            color: white;
        }
    }

    section {
        margin: 1em;
        min-height: 50vh;
        height: 100%;

        div.flex {
            display: flex;
            flex-flow: column wrap;
            max-height: 100%;
            
            & > div {
                padding: 0;
            }

            div.labels {
                text-align: left;
                padding: .4em 1em;
                min-height: 2.6em;
            }

            i.bx {
                color: gray;
                font-size: smaller;
            }
        }

        div.option {
            padding: 4px;
            display: flex;

            a, span {
                white-space: nowrap;
            }

            div {
                padding: 0 1em;
            }

            &:hover {
                background-color: var(--primselect);
                transition: all .2s ease-in-out;
            }
        }
    }

    .warn {
        padding: .4em 1em;
        border: 1px solid gray;
        background-color: goldenrod;
        text-align: center;
        white-space: nowrap;
    }
}
</style>