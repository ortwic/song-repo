<script lang="ts">
    import { fade, slide, type SlideParams } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';

    let snackbar: HTMLDivElement;
    let snackbarMessage = '';
    let visible = false;
    let className = '';
    let timeoutId: NodeJS.Timeout; 

    export const open = (text: string, timeoutMs = 3000) => {
      show(text, timeoutMs);
    };

    export const error = (text: string, timeoutMs = 3000) => {
      className = 'error';
      show(text, timeoutMs);
    };

    export const close = () => {
      snackbarMessage = '';
      className = '';
      visible = false;
    };

    function show(text: string, timoutMs: number) {
      visible = true;
      snackbarMessage = text;

      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => close(), timoutMs);
    }

    const slideFade = (node: Element, { delay = 0, duration = 400 }: SlideParams) => ({
      delay,
      duration,
      css: (t: number, u: number) => {
        const slideTransition = slide(node, { delay, duration, easing: cubicOut });
        const fadeTransition = fade(node, { delay, duration, easing: cubicOut });
        return `${slideTransition.css(t, u)} ${fadeTransition.css(t, u)}`;
      }
    })
</script>

{#if visible}
<div id="snackbar" class={className} 
  in:slideFade={{duration: 200}} 
  out:slideFade={{duration: 200}} 
  bind:this={snackbar}>
  {snackbarMessage}
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