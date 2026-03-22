<script lang="ts">
  import { t } from 'svelte-i18n';
    import UserService from '../service/user.service';
    import NavButton from '../components/ui/elements/NavButton.svelte';
    import NotFound from './NotFound.svelte';

  export let params: { alias?: string } = {};

  const userService = new UserService();
  const profile$ = userService.getProfileByAlias(params.alias);

</script>

<main class="content">
  {#if $profile$.id}
  <h2>{$profile$.name}</h2>
  <section class="menu">
    <NavButton href="/songs/@{$profile$.id}">
      <span>
        <i class='bx bxs-playlist'></i> {$t('user.song-list')}
    </NavButton>
  </section>
  {:else}
    <NotFound>
      <p>{$t('user.alias-unknown')}</p>
    </NotFound>
  {/if}
</main>

<style>
    h2 {
      text-align: center;
      color: var(--primary);
    }
</style>