<script lang="ts">
    import { t } from 'svelte-i18n';
    import { setContext } from 'svelte';
    import PromptDialog from './dialogs/PromptDialog.svelte';
    import EditSongDialog from './dialogs/EditSongDialog.svelte';
    import type { Dialog } from '../model/dialog.model';
    import type { UserSong } from '../model/song.model';
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();

    let prompt: PromptDialog = $state();
    let editSong: EditSongDialog = $state();

    setContext<Dialog<string>>('resource-dialog', {
        open: (uri: string) => prompt.showDialog(uri)
    });

    setContext<Dialog<Partial<UserSong>>>('editsong-dialog', {
        open: (song?: Partial<UserSong>) => editSong.showDialog(song)
    });
</script>

<PromptDialog
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
</PromptDialog>

<EditSongDialog bind:this={editSong} />

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