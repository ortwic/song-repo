<script lang="ts">
    let snackbar: HTMLDivElement;
    let snackbarMessage = '';
    let className = '';
    let timeoutId: NodeJS.Timeout; 

    export const open = (text: string, timeoutMs = 3000) => {
      className = 'show';
      show(text, timeoutMs);
    };

    export const error = (text: string, timeoutMs = 3000) => {
      className = 'show error';
      show(text, timeoutMs);
    };

    export const close = () => {
      snackbarMessage = '';
      className = '';
    };

    function show(text: string, timoutMs: number) {
      snackbarMessage = text;

      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => close(), timoutMs);
    }
</script>
  
<div id="snackbar" class={className} bind:this={snackbar}>
  {snackbarMessage}
</div>

<style>
   /* The snackbar - position it at the bottom and in the middle of the screen */
  #snackbar {
    visibility: hidden; 
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

  /* Show the snackbar when clicking on a button (class added with JavaScript) */
  #snackbar.show {
    visibility: visible; 
    -webkit-animation: fadein 0.5s, fadeout 0.5s 2.5s;
    animation: fadein 0.5s, fadeout 0.5s 2.5s;
  }

  #snackbar.error {
    background-color: firebrick;
  }

  /* Animations to fade the snackbar in and out */
  @-webkit-keyframes fadein {
    from {bottom: -3rem; opacity: 0;}
    to {bottom: 0; opacity: 1;}
  }

  @keyframes fadein {
    from {bottom: -3rem; opacity: 0;}
    to {bottom: 0; opacity: 1;}
  }

  @-webkit-keyframes fadeout {
    from {bottom: 0; opacity: 1;}
    to {bottom: -3rem; opacity: 0;}
  }

  @keyframes fadeout {
    from {bottom: 0; opacity: 1;}
    to {bottom: -3rem; opacity: 0;}
  } 
</style>