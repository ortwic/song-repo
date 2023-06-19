<script lang="ts">
    import Snackbar, { Label } from '@smui/snackbar';

    let snackbar: Snackbar;
    let snackbarMessage = '';

    export const open = (text: string) => {
      snackbarMessage = text;
      snackbar.open();
    };
</script>
  
<Snackbar bind:this={snackbar} labelText={snackbarMessage}>
    <Label />
</Snackbar>