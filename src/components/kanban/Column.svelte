<script lang="ts">
    import Button, { Icon } from "@smui/button";
    import Card, { Content } from "@smui/card";
    import { createEventDispatcher } from "svelte";
    import type { Status } from "../../model/types";
    import Tile from "./Tile.svelte";

    type T = $$Generic<{
        id: string,
        uid: string,
        title: string,
        status: Status,
        progress?: number
    }>;

    export let title: string;
    export let items: T[];
    
    const dispatch = createEventDispatcher();
    const add = () => dispatch('addElement');
    const changeStatus = (item: T, direction: number) => dispatch('changeStatus', { item, direction });
    
    function remove(item: T): void {
        items = items.filter((i) => i !== item);
    }
</script>

<Card>
    <div class="wrapper">
      <h2>{title}</h2>
      <Content>
        {#if items}
          {#each items as item (item.id)}
            <Tile {...item} 
              on:prev={() => changeStatus(item, -1)} 
              on:next={() => changeStatus(item, 1)} 
              on:remove={() => remove(item)} 
            />
          {/each}
        {/if}
      </Content>
    </div>
    <Button color="secondary" on:click={add}>
        <Icon class="material-icons">add</Icon>
    </Button>
</Card>

<style lang="css">
    h2 {
        text-align: center;
    }

    div.wrapper {
        display: flex;
        flex-direction: column;
        flex: 1;
        width: 20rem;
        max-height: 100%;
    }
</style>