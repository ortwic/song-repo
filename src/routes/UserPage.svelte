<script lang="ts">
  import { t } from 'svelte-i18n';
  import { startWith, switchMap } from 'rxjs';
  import type { UserLink } from '../model/user.model';
  import UserService from '../service/user.service';
  import { UserLinkService } from '../service/user-link.service';
  import NavButton from '../components/ui/elements/NavButton.svelte';
  import NotFound from './NotFound.svelte';

  export let params: { alias?: string } = {};

  const userService = new UserService();
  const profile$ = userService.getProfileByAlias(params.alias);
  const links$ = profile$.pipe(
    switchMap(p => new UserLinkService(p.id).userlinks),
    startWith([] as UserLink[])
  );

</script>

<main class="content">
  {#if $profile$.id}
  <h2>{$profile$.name}</h2>
  <p class="about">{$profile$.about ?? ''}</p>
  <section class="menu">
    <NavButton href="/songs/@{$profile$.id}">
      <span>
        <i class='bx bxs-playlist'></i> {$t('user.song-list')}
      </span>
    </NavButton>
    {#each $links$ as link}
      <div class="row">
        <a role="button" href="#/links/{link.url}" target="_blank">
          <span>
            <i class="bx {link.icon}"></i> {link.title}
          </span>
        </a>
      </div>
    {/each}
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

    .about {
      padding: 0 1em;
    }
</style>