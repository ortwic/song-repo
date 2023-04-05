<script lang="ts">
    import { nanoid } from 'nanoid';
    import { groupBy } from 'lodash';
    import { Status, type Item } from '../model/types';
    import Column from './Column.svelte';
  
    export let data: Item[];
    $: groups = groupBy(data, 'status');

    function add(status: Status): void {
        const id = nanoid();
        groups[status] = [...groups[status], {
            id,
            status,
            title: `${Status[status]} ${groups[status].length}`
        }];
    }

    function change(item: Item, direction: number): void {
        groups[item.status] = groups[item.status].filter((i: Item) => i !== item);
        if (item.status === Status.Done) {
            item.status = Status.Repeat;
        } else if (item.status === Status.Repeat) {
            item.status = Status.Done;
        } else {
            item.status = item.status + direction;
        }
        console.log(item);
        groups[item.status] = [...groups[item.status], item];
    }
</script>
  
  <div class="root">
    <div class="columns-container">
        <div>
            <Column title="To Do" bind:items={groups[1]} 
                on:addElement={() => add(Status.Todo)} 
                on:changeStatus={({ detail }) => change(detail.item, detail.direction)} 
            />
        </div>
        <div>
            <Column title="In Progress" bind:items={groups[2]} 
                on:addElement={() => add(Status.Wip)} 
                on:changeStatus={({ detail }) => change(detail.item, detail.direction)} 
            />
        </div>
        <div>
            <Column title="Done" bind:items={groups[3]} 
                on:addElement={() => add(Status.Done)} 
                on:changeStatus={({ detail }) => change(detail.item, detail.direction)} 
            />
        </div>
        <div>
            <Column title="Repeat" bind:items={groups[4]}
                on:addElement={() => add(Status.Repeat)} 
                on:changeStatus={({ detail }) => change(detail.item, detail.direction)} 
            />
        </div>
    </div>
</div>
    
<style lang="css">

    div.root {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
  
    div.columns-container {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-between;
      margin: 1.5vw 2.5vw;
      height: 100%;
      max-height: 100vh;
    }

    div.columns-container div {
      padding: .4rem;
      /* height: 80vh; */
    }
</style>
