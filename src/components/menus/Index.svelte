<script lang='ts'>
    import '../../styles/menu.scss';
    import ExportTable from '../table/ExportTable.svelte';
    import NavButton from '../ui/elements/NavButton.svelte';
</script>

<NavButton href="/songs" title="Your songs">
    <span><i class='bx bxs-playlist'></i> Your songs</span>
</NavButton>
<NavButton href="/feedback" title="Send feedback">
    <span><i class='bx bx-mail-send'></i> Send feedback</span>
</NavButton>
<div class="row">
    <a role="button" target="_blank" href="http://buymeacoffee.com/ortwic">
        <span><i class='bx bxs-coffee'></i> Buy me a coffee</span>
    </a>
</div>
<div class="row">
    <a role="button" target="_blank" href="https://github.com/users/ortwic/projects/2/views/1">
        <span><i class="bx bxl-github"></i> Feature overview</span>
    </a>
</div>
{#if location.href.includes('/songs')}
<ExportTable />
{/if}
