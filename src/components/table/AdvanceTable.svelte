<script lang='ts'>
    import { map, of, type Observable } from 'rxjs';
    import type { ColumnDefinition } from 'tabulator-tables';
    import FileDrop from './FileDrop.svelte';
    import Table from './Table.svelte';
    import { autoColumns } from './templates/column.helper';
    import ConfirmDialog from '../ui/ConfirmDialog.svelte';
    import TabbedTitle from '../ui/TabbedTitle.svelte';
    import FirestoreService, { uniqueKey } from '../../service/firestore.service';
    import { showInfo, showError } from '../../store/notification.store';

    type DataWithId = { id: string };
    
    const pages = { feedback: 'Feedback', settings: 'Settings', genres: 'Genres'  };
    type Pages = keyof typeof pages;
    let active: Pages;
    let columns: Observable<ColumnDefinition[]>;
    let data: Observable<DataWithId[]>;

    const stores = {
        genres: new FirestoreService('genres'),
        settings: new FirestoreService('settings'),
        feedback: new FirestoreService('feedback'),
    }
    let sub: { unsubscribe: () => void; };

    async function changePage(page: Pages) {
        active = page;
        sub?.unsubscribe();
        data = stores[active].getDocuments();
        columns = data.pipe(map(autoColumns));
    }

    async function importJSON(event: CustomEvent): Promise<void> {
        try {
            const json = JSON.parse(event.detail);
            if (json?.length) {
                const field = Object.keys(json[0])[0];
                if (field) {
                    columns = of(autoColumns(json));
                    const dataWithId = json.map(obj => ({ id: uniqueKey(obj[field]), ...obj }));
                    data = of(dataWithId);
                    await stores[active]?.setDocuments(dataWithId, { merge: true });

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
        {#if $columns?.length}
        <Table {data} columns={$columns} idField='id' />
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