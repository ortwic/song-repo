<script lang='ts'>
  import { onDestroy, tick } from "svelte";
  import { slideFade } from "./transition.helper";
  import { portal } from "svelte-portal";

  export let width: string | number = "auto";
  let menu: HTMLDivElement;
  let clientX = 0, clientY = 0;
  let left: string | number, top: string | number, offsetWidth: number, offsetHeight: number;
  let visible = false;
    
  onDestroy(() => {
    document.removeEventListener('click', clickOutside, true);
  });

  document.addEventListener('click', clickOutside, true);

  export const showPopupMenu = (e: { clientX: number, clientY: number }) => {
    clientX = e.clientX;
    clientY = e.clientY;
    visible = true;
  };

  $: top = clientY + offsetHeight > window.innerHeight 
    ? `${clientY - offsetHeight}px`
    : `${clientY}px`;
    
  $: left = clientX + offsetWidth > window.innerWidth 
      ? `${clientX - offsetWidth}px`
      : `${clientX}px`;

  function clickOutside({ target }) {
    if (!menu.contains(target)) {
      hide();
    }
  }

  function hide() {
    visible = false;
  }
</script>

<div use:portal={document.body} class="container" aria-hidden="true" bind:this={menu} style:left style:top style:width
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
      box-shadow: .1em .1em .4em #00000080;
    }
  }
</style>