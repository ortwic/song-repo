<script lang="ts">
    import { slideFade } from "./transition.helper";

    let snackbar: HTMLDivElement;
    let snackbarMessage = '';
    let visible = false;
    let className = '';
    let timeoutId: NodeJS.Timeout; 

    export const open = (text = '', timeoutMs = 3000): void => {
      show(text, timeoutMs);
    };

    export const error = (text = '', timeoutMs = 3000): void => {
      className = 'error';
      show(text, timeoutMs);
    };

    export const close = (): void => {
      snackbarMessage = '';
      className = '';
      visible = false;
    };

    function show(text: string, timeoutMs: number) {
      visible = true;
      snackbarMessage = text;

      clearTimeout(timeoutId);
      if (timeoutMs > 0) {
        timeoutId = setTimeout(() => close(), timeoutMs);
      }
    }

</script>

{#if visible}
<div id="snackbar" class={className} 
  in:slideFade={{duration: 200}} 
  out:slideFade={{duration: 200}} 
  bind:this={snackbar}>
  {snackbarMessage}
  <slot name="message"></slot>
</div>
{/if}

<style lang="scss">
  #snackbar {
    position: fixed; 
    padding: 16px;
    z-index: 1;
    left: 0;
    bottom: 0;
    width: 100%; 
    text-align: center; 
    color: white;
    background-color: var(--primary);
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 1);
  }

  #snackbar.error {
    background-color: firebrick;
  }
</style>