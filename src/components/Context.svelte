<script lang="ts">
    import { t } from 'svelte-i18n';
    import { setContext } from 'svelte';
    import Prompt from './dialogs/PromptDialog.svelte';
    import type { Dialog } from '../model/dialog.model';
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();

    let prompt: Dialog<string> = $state();

    setContext('resource-prompt', {
        showDialog: (uri: string) => prompt.showDialog(uri)
    });
</script>

<Prompt
    bind:this={prompt}
    type="url"
    placeholder="https://example.com/files/sheet-music.pdf"
    title={$t('songs.resource.title')}
    caption={$t('songs.resource.caption')}
>
    <div class="info" title="Tip">
        <i class="bx bx-info-circle"></i>
        {$t('songs.resource.info')}
    </div>
</Prompt>

{@render children?.()}

<style lang="scss"> 
  .info {
      padding: .4em 1em;
      border: 1px solid gray;
      background-color: #8be2ff80;
      text-align: center;
      white-space: collapse balance;
  }
</style>