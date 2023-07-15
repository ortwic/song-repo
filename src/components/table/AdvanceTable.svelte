<script lang='ts'>
    import FileDrop from './FileDrop.svelte';
    import Table from './Table.svelte';
    import { autoColumns } from './templates/column.helper';
    import ConfirmDialog from '../ui/ConfirmDialog.svelte';
    import FirestoreService, { uniqueKey } from '../../service/firestore.service';
    import { showInfo, showError } from '../../store/notification.store';

    type Pages = 'none' | 'genres' | 'artists';
    const stores = {
        genres: new FirestoreService('genres'),
        artists: new FirestoreService('artists'),
    }
    let current: Pages = 'none';
    let sub: { unsubscribe: () => void; };

    async function changePage(page: Pages) {
        current = page;
        sub?.unsubscribe();
        sub = stores[current].getDocuments().subscribe(result => {
            columns = autoColumns(result);
            data = result;
        });
    }

    async function importJSON(event: CustomEvent): Promise<void> {
        try {
            const json = JSON.parse(event.detail);
            if (json?.length) {
                const field = Object.keys(json[0])[0];
                if (field) {
                    columns = autoColumns(json);
                    data = json.map(obj => ({ id: uniqueKey(obj[field]), ...obj }));
                    await stores[current]?.setDocuments(data, { merge: true });

                    showInfo(`Found ${json.length} entries.`);
                }
            }
        } catch (error) {
            showError(error.message);
        }
    }

    function done({ detail }) {
        current = 'none';

        if (detail) {
            showInfo('Done');
        }
    }

    $: columns = [];
    $: data = [];
</script>

<div class="row">            
    <button on:click={() => changePage('genres')}>
        <i class='bx bxs-edit'></i> Edit master data
    </button>
</div>

{#if current != 'none'}
<ConfirmDialog target='login' size='max' on:closed={done}>
    <span class='tabs' slot="title">
        <button on:click={() => changePage('genres')}>Genre</button>
        <button on:click={() => changePage('artists')}>Artists</button>
    </span>
    <FileDrop on:enter={() => showInfo('Start importing...')} on:addJson={importJSON}>
        {#if columns?.length}
        <Table {data} {columns} usePersistance={false} />
        {:else}
        <div class='placeholder'>Drop json-file here to import data</div>
        {/if}
    </FileDrop>
</ConfirmDialog>
{/if}


<style lang="scss">
    span.tabs button {
        color: black;

        &:focus {
            color: var(--primary);
        }
    }

    div.placeholder {
        width: 100%;
        height: 100%;
        transform: translate(50%, 50%);
    }
</style>