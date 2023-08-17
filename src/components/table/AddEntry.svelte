<script lang="ts">
    import '../../styles/search.scss';
    import { onMount } from "svelte";
    import Autocomplete from 'simple-svelte-autocomplete/src/SimpleAutocomplete.svelte';
    import AddButton from "../ui/AddButton.svelte";
    import ConfirmDialog from "../ui/ConfirmDialog.svelte";
    import Image from "../ui/elements/Image.svelte";
    import SelectKey from '../ui/SelectKey.svelte';
    import LoadingBar from '../ui/elements/LoadingBar.svelte';
    import SongService from "../../service/song.service";
    import SearchService, { create } from "../../service/search.service";
    import type { UserSong } from "../../model/song.model";
    import type { ArtistResult, SongResult } from "../../model/songbpm.model";
    import genres from '../../data/genres.json';
    
    const required = true;
    const songService = new SongService();
    let searchService: SearchService;
    let form: HTMLFormElement;
    let visible = false;

    let newSong: Partial<UserSong>;
    const styles = (genre: string) => (genres.find(v => v.name === genre) ?? genres[0]).styles;
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
    <ConfirmDialog size='auto' on:closed={done}>
        <div class="title" slot="title">
            Search - powered by <a href="https://getsongbpm.com/api" target="_blank">GetSongbpm</a>
        </div>
        <section>
            <div class="section flex">
                <div>
                    <label for="artist">Artist</label>
                    <Autocomplete inputClassName="lg" labelFieldName="name" {required} placeholder="artist"
                        delay={500} minCharactersToSearch={2} hideArrow={true} bind:text={newSong.artist}
                        searchFunction={(value) => searchService.findArtists(value)}
                        onChange={(item) => setArtist(item)} clearSelection={() => setArtist()} showClear={true}
                        showLoadingIndicator={true}>
                        <div class="card" slot="item" let:item>
                            <Image src={item.img} />
                            <div class="col">
                                <a title="Artist" href={item.uri} target="_blank">{item.name}</a>
                                <span title="Country">{item.from ?? ''}</span>
                                <p>
                                    {#each item.genres ?? [] as genre}
                                    <span class='label'>{genre}</span>
                                    {/each}
                                </p>
                            </div>
                        </div>
                        <div slot="loading">
                            <LoadingBar />
                        </div>
                    </Autocomplete>
                </div>
                <div>
                    <label for="title">Title</label>
                    <Autocomplete inputClassName="lg" labelFieldName="title" {required} placeholder="title"
                        delay={newSong.artist ? 500 : 990} minCharactersToSearch={newSong.artist ? 0 : 3} hideArrow={true}
                        searchFunction={(value) => searchService.findSongs(value, newSong.artist)} 
                        onChange={(item) => setSong(item)} clearSelection={() => setSong()} showClear={true}
                        showLoadingIndicator={true}>
                        <div class="card" slot="item" let:item>
                            <a title={item.album?.title} href={item.album?.uri ?? item.artist?.uri} target="_blank">
                                <Image src={item.album?.img ?? item.artist?.img} />
                            </a>
                            <div class="col">
                                <a title="Title" href={item.uri} target="_blank">{item.title}</a>
                                {#if newSong.artist}
                                <span title="Year">({item.album?.year})</span>
                                <p>
                                    <span title="Tempo" class='label'>{item.tempo}</span>
                                    <span title="Time" class='label'>{item.time_sig}</span>
                                    <span title="Key" class='label'>{item.key_of}</span>
                                </p>
                                {:else}
                                <br>
                                <a title="Artist" href={item.artist?.uri} target="_blank">{item.artist?.name}</a>
                                <p>
                                    {#each item.artist?.genres ?? [] as genre}
                                    <span class='label'>{genre}</span>
                                    {/each}
                                </p>
                                {/if}
                            </div>
                        </div>
                    </Autocomplete>
                </div>
                <div>
                    <label for="genre">Genre</label>
                    <Autocomplete inputClassName="lg" labelFieldName="name" placeholder="genre"
                        minCharactersToSearch={0} items={genres} showClear={true}
                        bind:text={newSong.genre} hideArrow={true}
                        onChange={() => newSong.style = undefined}>
                        <svelte:fragment slot="item" let:item let:label>
                            <div class="square" style:background-color={item.color}></div>
                            <span class="option">{@html label}</span>
                        </svelte:fragment>
                    </Autocomplete>
                </div>
                <div>
                    <label for="style">Styles</label>
                    <Autocomplete inputClassName="lg" placeholder="style" hideArrow={true}
                        minCharactersToSearch={0} searchFunction="{() => styles(newSong.genre[0])}" showClear={true}>
                        <svelte:fragment slot="item" let:item let:label>
                            <span class="option">{@html label}</span>
                        </svelte:fragment>
                    </Autocomplete>
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
                    <label for="key">Key</label>
                    <SelectKey bind:value={newSong.key} />
                </div>
                <div>
                    <label for="bpm">Tempo</label>
                    <input id="bpm" class="sm" type="text" placeholder="120" bind:value={newSong.bpm} on:keydown={addLabel}>
                </div>
                <div>
                    <label for="time">Time</label>
                    <input id="time" class="sm" type="text" placeholder="4/4" bind:value={newSong.time} on:keydown={addLabel}>
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

    div.square {
        display: inline-block;
        width: 1.2em;
        height: 1.2em;
    }

    span.option {
        padding: .4em;
    }

    section {
        margin: 1em;
        min-width: 38em;

        // not working as autocomplete-list not overlapping anymore
        // overflow-y: auto; 

        div.flex {
            display: flex;
            flex-flow: row wrap;
            max-height: 100%;
            
            & > div {
                padding: 0;
                margin-right: 2em;
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