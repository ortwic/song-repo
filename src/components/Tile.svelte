<script lang="ts">

    import { createEventDispatcher } from 'svelte';
    import Button, { Icon } from '@smui/icon-button';
    import Card, { Content } from '@smui/card';
    import Chip, { Set, Text } from '@smui/chips';
    import Autocomplete from '@smui-extra/autocomplete';
    import { Status } from '../model/types';
    import InlineEdit from './InlineEdit.svelte';
    import genres from '../data/genres.json'

    const dispatch = createEventDispatcher();    
    const down = () => {
        if (progress > 99) {
            dispatch('next', id);
        }
        progress -= 10;
        if (progress < 1) {
            dispatch('prev', id);
        }
    }
    const up = () => {
        if (progress < 1) {
            dispatch('next', id);        
        }
        progress += 10;
        if (progress > 99) {
            dispatch('next', id);
        }
    }
    const remove = () => dispatch('remove', id);
    
    export let id: string; // document ID
    export let title: string;
    export let status: Status;
    export let artist = 'Unknown';
    export let genre = 'Unknown';
    export let progress = 0;
    export let learnedOn = new Date();
    export let tags = new Array<string>();

    const genreArray = Object.keys(genres);
    let width: number;
    $: progressStyle = `width: ${width * progress * .01}px; background-color: ${genres[genre] ?? 'black'}`;
</script>

<section class="card">
    <Card variant="outlined">
        <div class="header">
            <Button color="secondary" size="button" on:click={remove}>
                <Icon class="material-icons">close</Icon>
            </Button>
            <Button disabled={progress > 99} color="primary" size="button" on:click={up}>
                <Icon class="material-icons">north</Icon>
            </Button>
            <span class="progress">{progress} %</span>
            <Button disabled={progress < 1} color="primary" size="button" on:click={down}>
                <Icon class="material-icons">south</Icon>
            </Button>
        </div>
        <div class={`${Status[status]}`} bind:clientWidth={width}>
            <Content>
                <div>
                    <Autocomplete label="Genre" options={genreArray} bind:value={genre} />
                </div>
                <div style="margin-bottom: .4rem">
                    <InlineEdit value={title} placeholder="Title" />
                    -
                    <InlineEdit value={artist} placeholder="Artist" />
                </div>
                <Set chips={tags} let:chip>
                    <Chip {chip}>
                        <Text>{chip}</Text>
                    </Chip>
                </Set>
            </Content>
            <div class="footer">
                <div class="progress" style={progressStyle}></div>
            </div>
        </div>
    </Card>
</section>

<style lang="css">
    .card {
        white-space: nowrap;
        vertical-align: middle;
    }
    div.header {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 0;
        right: 0;
        z-index: 255;
    }
    div.footer {
        position: absolute;
        bottom: 0;
        left: 0;
        z-index: 0;
        width: 100%;
        height: 4px;
        background-color: #e6e6e6;
    }
    span.progress {
        font-size: small;
        text-align: right;
        padding-right: 2px;
    }
    div.progress {
        height: 4px;
        border-bottom-left-radius: var(--mdc-shape-medium, 4px);
        border-bottom-right-radius: var(--mdc-shape-medium, 4px);
    }
    /* .Todo {
        background-color: cornsilk;
    }
    .Wip {
        background-color: lightskyblue;
    }
    .Done {
        background-color: lightgreen;
    }
    .Repeat {
        background-color: lightcoral;
    } */
</style>
