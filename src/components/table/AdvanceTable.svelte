<script lang='ts'>
    import FileDrop from './FileDrop.svelte';
    import Table from './Table.svelte';
    import { autoColumns } from './templates/column.helper';
    import ConfirmDialog from '../ui/ConfirmDialog.svelte';
    import TabbedTitle from '../ui/TabbedTitle.svelte';
    import FirestoreService, { uniqueKey } from '../../service/firestore.service';
    import { showInfo, showError } from '../../store/notification.store';
    
    const pages = { feedback: 'Feedback', settings: 'Settings', genres: 'Genres'  };
    type Pages = keyof typeof pages;
    let active: Pages;

    const stores = {
        genres: new FirestoreService('genres'),
        settings: new FirestoreService('settings'),
        feedback: new FirestoreService('feedback'),
    }
    let sub: { unsubscribe: () => void; };

    async function changePage(page: Pages) {
        active = page;
        sub?.unsubscribe();
        sub = stores[active].getDocuments().subscribe(result => {
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
                    await stores[active]?.setDocuments(data, { merge: true });

                    showInfo(`Found ${json.length} entries.`);
                }
            }
        } catch (error) {
            showError(error.message);
        }
    }

    function done({ detail }) {
        active = undefined;

        if (detail) {
            showInfo('Done');
        }
    }

    $: columns = [];
    $: data = [];
</script>
           
<div class="row">    
    <button class='edit' title='Edit master data' on:click={() => changePage('feedback')}>
        <i class='bx bxs-edit'></i> <slot></slot>
    </button>
</div>

{#if active}
<ConfirmDialog target='login' size='max' on:closed={done}>
    <span slot="title">
        <TabbedTitle tabs={pages} {active} on:tabChange={({ detail }) => changePage(detail)} />
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
    div.placeholder {
        width: 100%;
        height: 100%;
        transform: translate(50%, 50%);
    }

    button.edit {
        padding: 0;
        outline: 0;
        border: inherit;
        box-shadow: inherit;
        // cursor: inherit;
        // color: inherit;
        // background-color: inherit;
        // font-weight: inherit;
        // text-shadow: inherit;
    }
</style>