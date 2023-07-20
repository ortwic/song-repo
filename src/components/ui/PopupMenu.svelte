<script lang='ts'>
  import { onDestroy } from "svelte";
  import { slideFade } from "./transition.helper";

  let menu: HTMLDivElement;
  let left: string | number, top: string | number, offsetHeight: number;
  let visible = false;
    
  onDestroy(() => {
    document.removeEventListener('click', clickOutside, true);
  });

  document.addEventListener('click', clickOutside, true);

  export const showPopupMenu = ({ clientX, clientY }) => {
    const setPosition = () => {
      const maxTop = document.body.offsetHeight - offsetHeight;
      top = `${clientY > maxTop ? clientY - offsetHeight : clientY}px`;
      left = `${clientX}px`;
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

<div aria-hidden="true" bind:this={menu} style:left style:top bind:offsetHeight
  class='popup-menu' on:click={hide}>
    {#if visible}
    <div in:slideFade={{ duration: 200 }} out:slideFade={{ duration: 200 }}>
      <slot></slot>
    </div>
    {/if}
</div>

<style lang="scss">  
  div.popup-menu {
    position: absolute;
    z-index: 80;

    div {
      display: flex;
      flex-direction: column;
    }
  }
</style>