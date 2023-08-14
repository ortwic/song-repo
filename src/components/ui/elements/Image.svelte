<script lang="ts">
  import { onMount } from 'svelte';
  let canvas: HTMLCanvasElement;
  export let src: string;
  export let width = 50;
  export let height = 50;
  
  onMount(async () => {
    if (canvas) {
      const img = new Image();
      img.src = src;
      await img.decode();
      
      const targetRatio = width / height;
      const aspectRatio = img.width / img.height;

      if(aspectRatio > targetRatio) {
        const newWidth = img.height * targetRatio;
        const startX = (img.width - newWidth) / 2;
        drawImage(img, startX, 0, newWidth, img.height); 
      } else {
        const newHeight = img.width / targetRatio;
        const startY = (img.height - newHeight) / 2;
        drawImage(img, 0, startY, img.width, newHeight); 
      }
    }
  });

  function drawImage(img: CanvasImageSource, sx: number, sy: number, sw: number, sh: number): void {
    const ctx = canvas?.getContext('2d');
    ctx?.drawImage(img, sx, sy, sw, sh, 0, 0, width, height); 
  }
</script>
  
<div style:width="{width}px" style:height="{height}px">
  {#if src}
  <canvas {width} {height} bind:this={canvas} />
  {:else}
  <span>n/a</span>
  {/if}
</div>

<style lang="scss">
div {
    color: gray;
    border: 1px solid gray;
    text-align: center;
    display: flex;
    justify-content: center;
    flex-direction: column;
}
</style>

