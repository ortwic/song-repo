<script lang='ts'>
  import { createEventDispatcher } from "svelte";
  import type { CellComponent } from "tabulator-tables";
  import PopupMenu from "../../ui/PopupMenu.svelte";
  import { slideFade } from "../../ui/transition.helper";
  import type { Status } from "../../../model/types";

  const dispatch = createEventDispatcher();
  let showPopupMenu: (ev: PointerEvent) => void;
  let currentCell: CellComponent;
  let confirmDelete = false;

  const changeStatusHandler = (status: Status) => {
    const element = currentCell.getElement();
    element.classList.replace(currentCell.getValue(), status);
    currentCell.setValue(status);
  };

  export const statusFormatter = (cell: CellComponent): string => {
    const value = cell.getValue().toString();
    const element = cell.getElement();
    element.title = value;
    element.classList.add('status', value);
    element.addEventListener('click', (ev: PointerEvent) => {
      showPopupMenu(ev);
      currentCell = cell;
    });
    return `<span style='display:none'>${value}</span>`;
  };

  function deleteElement() {
    confirmDelete = false;
    dispatch('delete', currentCell.getData());
  }
</script>

<PopupMenu bind:showPopupMenu>
  <button class='menu-item' on:click={() => changeStatusHandler('todo')}>
    <i class='status todo'></i><span>Todo</span>
  </button>
  <button class='menu-item' on:click={() => changeStatusHandler('wip')}>
    <i class='status wip'></i><span>Wip</span>
  </button>
  <button class='menu-item' on:click={() => changeStatusHandler('done')}>
    <i class='status done'></i><span>Done</span>
  </button>
  <button class='menu-item' on:click={() => changeStatusHandler('repeat')}>
    <i class='status repeat'></i><span>Repeat</span>
  </button>
  <button class='menu-item' on:click={() => changeStatusHandler('archived')}>
    <i class='status archived'></i><span>Archived</span>
  </button>
  <button class='menu-item' on:click|stopPropagation={() => confirmDelete = !confirmDelete}>
    <i class='status delete'></i><span>Delete?</span>
  </button>
  {#if confirmDelete}
  <button class='menu-item' on:click={deleteElement}
    in:slideFade={{ duration: 200 }} out:slideFade={{ duration: 200 }}>
    <i class='status'></i><span>✓ Yes</span>
  </button>
  {/if}
</PopupMenu>

<style lang="scss">
  button.menu-item {
    border: 0;
    border-radius: 0;
    color: var(--text);
    padding: 6px 20px 6px 12px;
    text-align: left;
    font-weight: normal;
    transition: all .2s ease-in-out;

    &:hover {
      background-color: white;
    }

    i.status {
      display: inline-block;
      width: 1.6em;
    }
  }
</style>
    