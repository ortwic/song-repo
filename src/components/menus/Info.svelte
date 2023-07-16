<script lang='ts'>
    import '../../styles/menu.scss';
    import FeedbackDialog from './FeedbackDialog.svelte';
	import { currentUser } from '../../service/auth.service';
    import { usersongs } from "../../store/song.store";
    import type { UserSong } from "../../model/song.model";
    import { onMount } from 'svelte';

    let feedbackForm: FeedbackDialog;

    onMount(async () => {
      if (location.search.indexOf('demo=samples') > 1 || location.hash.indexOf('samples')) {
        await loadSamples();
      }   
    })
    
    async function loadSamples(): Promise<void> {
        const { default: samples } = await import('../../data/samples.json');
        usersongs.set(samples as unknown as UserSong[]);
    }
</script>

{#if !$currentUser}
<div class="row">
    <button data-close title="Load demo sample data" on:click={loadSamples}>
        <i class='bx bx-test-tube'></i> Demo samples
    </button>
</div>
{/if}
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