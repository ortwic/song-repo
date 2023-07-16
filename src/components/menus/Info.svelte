<script lang='ts'>
    import '../../styles/menu.scss';
    import FeedbackDialog from './FeedbackDialog.svelte';

    let feedbackForm: FeedbackDialog;
</script>

<div class="row">
  <button data-close title="Send feedback" on:click={feedbackForm.show}>
      <span><i class='bx bx-mail-send'></i> Send feedback</span>
  </button>
</div>
<div class="row">
    <a role="button" target="_blank" href="http://buymeacoffee.com/ortwic">
        <span><i class='bx bxs-coffee'></i> Buy me a coffee</span>
    </a>
</div>
<div class="row">
    <a role="button" target="_blank" href="https://github.com/users/ortwic/projects/2/views/1">
        <span><i class="bx bxl-github"></i> Feature overview</span>
    </a>
</div>

<FeedbackDialog bind:this={feedbackForm}></FeedbackDialog>