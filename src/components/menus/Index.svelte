<script lang='ts'>
    import '../../styles/menu.scss';
    import ExportTable from '../table/ExportTable.svelte';
    import NavButton from '../ui/elements/NavButton.svelte';
</script>

<NavButton href="/songs" title="Your songs">
    <span><i class='bx bxs-playlist'></i> Your songs</span>
</NavButton>
<NavButton href="/blog" title="Making music blog">
    <span><i class='bx bx-bulb'></i> Making music</span>
</NavButton>
<div class="row">
    <a class="coffee" role="button" target="_blank" href="http://buymeacoffee.com/ortwic">
        <span><i class='bx bxs-coffee'></i> Buy me a coffee</span>
    </a>
</div>
{#if location.href.includes('/songs')}
<ExportTable />
{/if}

<style lang="scss">
    div.row > a.coffee {
        background-color: goldenrod;

        &:hover {
            background-color: wheat;
        }

        & > span {
            color: black;
        }
    }
</style>