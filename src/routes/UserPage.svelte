<script lang="ts">
  import { t } from 'svelte-i18n';
  import { marked } from 'marked';
  import { startWith, switchMap } from 'rxjs';
  import type { UserLink } from '../model/user.model';
  import UserService from '../service/user.service';
  import { UserLinkService } from '../service/user-link.service';
  import Avatar from '../components/ui/Avatar.svelte';
  import NavButton from '../components/ui/elements/NavButton.svelte';
  import { currentMenu } from '../store/app.store';
  import NotFound from './NotFound.svelte';

  export let params: { alias?: string } = {};

  const userService = new UserService();
  const profile$ = userService.getProfileByAlias(params.alias);
  const links$ = profile$.pipe(
    switchMap(p => new UserLinkService(p.id).userlinks),
    startWith([] as UserLink[])
  );
  currentMenu.set('user');

</script>

<main class="content">
  {#if $profile$.id}
  <h2>
    <Avatar photoURL={$profile$.photoURL} title={$profile$.name} />
    {$profile$.name}
  </h2>
  <p class="about">{@html marked($profile$.about) ?? ''}</p>
  <section class="menu">
    <NavButton href="/songs/@{$profile$.id}">
      <span>
        <i class='bx bxs-playlist'></i> {$t('user.song-list')}
      </span>
    </NavButton>
    {#each $links$ as link}
      <div class="row">
        <a role="button" href="{link.url}" target="_blank">
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
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5em;
        color: var(--primary);
    }
    
    .about {
      padding: 0 1em;
    }
</style>