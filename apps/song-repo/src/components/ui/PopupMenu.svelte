<script lang='ts'>
  import { onDestroy } from "svelte";
  import { slideFade } from "./transition.helper";

  export let width: string | number = "auto";
  let menu: HTMLDivElement;
  let left: string | number, top: string | number, offsetWidth: number, offsetHeight: number;
  let visible = false;
    
  onDestroy(() => {
    document.removeEventListener('click', clickOutside, true);
  });

  document.addEventListener('click', clickOutside, true);

  export const showPopupMenu = ({ clientX, clientY }) => {
    const setPosition = () => {
      const maxTop = document.body.offsetHeight - offsetHeight;
      const maxLeft = document.body.offsetWidth - offsetWidth;
      top = `${clientY > maxTop ? clientY - offsetHeight : clientY}px`;
      left = `${clientX > maxLeft ? clientX - offsetWidth : clientX}px`;
    };

    visible = true;
    setPosition();
  };


  function clickOutside({ target }) {
    if (!menu.contains(target)) {
      hide();
    }
  }

  function hide() {
    visible = false;
  }
</script>

<div class="container" aria-hidden="true" bind:this={menu} style:left style:top style:width
    bind:offsetWidth bind:offsetHeight on:click={hide}>
    {#if visible}
    <div class='popup-menu' in:slideFade={{ duration: 200 }} out:slideFade={{ duration: 200 }}>
      <slot></slot>
    </div>
    {/if}
</div>

<style lang="scss">
  div.container {
    position: fixed;
    z-index: 140;
    
    div.popup-menu {
      display: flex;
      flex-direction: column;
      border: 1px solid gray;
      box-shadow: .1em .1em .4em #00000080;
    }
  }
</style>