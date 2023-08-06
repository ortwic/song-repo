<script lang="ts">
    import AddButton from "../ui/AddButton.svelte";
    import ConfirmDialog from "../ui/ConfirmDialog.svelte";
    import TabbedTitle from '../ui/TabbedTitle.svelte';
    import SongService from "../../service/song.service";
    import type { UserSong } from "../../model/song.model";

    const service = new SongService();
    let form: HTMLFormElement;

    const pages = { search: 'Search', custom: 'Custom' };
    type Pages = keyof typeof pages;
    let active: Pages;

    let song: Partial<UserSong> = { tags: [] };
    let label = '';
    let search = '';
    
    function changePage(page: Pages) {
        active = page;
    }

    async function done({ detail: confirm }): Promise<void> {
        if (!confirm) {
            hide();
        } else if (form.checkValidity()) {
            if (label) {
                song.tags.push(label);
            }
            await service.addSong(song);

            hide();
        }
    }

    function hide(): void {
        song = { tags: [] };
        active = undefined;
    }

    function addLabel(ev: KeyboardEvent) {
        if(ev.key === ',') {
            ev.preventDefault();
            song.tags = [ ...song.tags, label ];
            label = '';
        }
    }

</script>

{#if !service.isShared()}
<AddButton title="add song" on:click={() => changePage('search')}/>
{/if}

{#if active}
<form bind:this={form} on:submit|preventDefault>
    <ConfirmDialog size='auto' on:closed={done}>
        <div class="title" slot="title">
            <TabbedTitle tabs={pages} {active} on:tabChange={({ detail }) => changePage(detail)} />
        </div>
        <section>
            {#if active === 'search'}
            <div class="section">
                <label for="search">Search</label>
                <input id="search" type="text" placeholder="search for artist or song title" bind:value={search}>
            </div>
            {:else if active === 'custom'}
            <div class="section flex">
                <div>
                    <label for="artist">Artist</label>
                    <input id="artist" type="text" required placeholder="artist" bind:value={song.artist}>
                </div>
                <div>
                    <label for="title">Title</label>
                    <input id="title" type="text" required placeholder="title" bind:value={song.title}>
                </div>
                <div>
                    <label for="source" title="markdown supported e.g. [link](http://example.com)">Source <i class='bx bx-help-circle'></i></label>
                    <input id="source" type="text" placeholder="source" bind:value={song.source}>
                </div>
                <div>
                    <label for="tags" title="comma separated e.g. Foo, Bar">Labels <i class='bx bx-help-circle'></i></label>
                    <input id="tags" type="text" placeholder="tags" bind:value={label} on:keydown={addLabel}>
                    <div class="flex labels">
                        {#each song.tags as tag}
                        <span class='label'>{tag}</span>
                        {/each}
                    </div>
                </div>
            </div>
            {/if}
        </section>
        {#if !service.hasUser()}
        <div class='warn'>You are not signed in, so data won't be persisted after leaving the app!</div>
        {/if}
    </ConfirmDialog>
</form>
{/if}

<style lang="scss">
div.title {
    text-align: left;
}

section {
    margin: 1em;
    min-height: 50vh;
    // border: 1px solid white;

    div.flex {
        display: flex;
        flex-wrap: wrap;

        div {
            // border: 1px solid silver;
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

    input {
        width: calc(100% - 3.6em);
    }
}

.warn {
    padding: .4em 1em;
    border: 1px solid gray;
    background-color: goldenrod;
    text-align: center;
    white-space: nowrap;
}
</style>