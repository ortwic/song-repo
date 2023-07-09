<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();
    
    function handleDrop(event: DragEvent) {
      for (const item of event.dataTransfer.items) {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file.type === 'application/json') {
            readFile(file, (data) => dispatch('addJson', data));
          } else if (file.type === 'text/csv') {
            readFile(file, (data) => dispatch('addCsv', data));
          } else {
            console.error('Unsupported file type:', file.type);
          }
        }
      }
    }

    function readFile(file: File, action: (data: string) => void) {
      const reader = new FileReader();
      reader.onload = () => action(`${reader.result}`);
      reader.readAsText(file);
    }
</script>

<div title='Drop file here to import data'
  on:dragover|preventDefault="{() => { }}" 
  on:dragenter|preventDefault="{() => dispatch('enter')}" 
  on:dragleave|preventDefault="{() => { }}"
  on:drop|preventDefault="{handleDrop}">
  <slot></slot>
</div>

<style>
  div {
    height: 100%;
    overflow: hidden;
  }
</style>