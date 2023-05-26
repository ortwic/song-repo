<script lang="ts">
    import type { User } from 'firebase/auth';
    import { of, type Observable } from 'rxjs';
    import Login from './components/login/Login.svelte';
    import Table from './components/table/Table.svelte';
    import { Status } from './model/types';
    import type { Song } from './model/song.model';
  
    let samples: Song[] = [
      { id: "1", uid: "0", title: "Fried Chicken", artist: "Jürgen Moser", status: Status.Todo, genre: 'Pop / Rock', tags: ["new"] },
      { id: "2", uid: "0", title: "Manhatten Skyline", artist: "Jürgen Moser", status: Status.Wip, genre: 'Rock Ballad', progress: 60, tags: [], fav: true },
      { id: "3", uid: "0", title: "Für Elise", artist: "Beethoven", status: Status.Done, genre: 'Classic', progress: 100, tags: [] },
      { id: "4", uid: "0", title: "Take 5", artist: "Dave Brubeck", genre: "Jazz", status: Status.Repeat, progress: 80, tags: ["improv", "lead sheet"] },
    ];

    let user: Observable<User>;
    $: data = of(samples);
</script>

<svelte:head>
	<link rel="stylesheet" href="node_modules/svelte-material-ui/bare.css"/>
</svelte:head>

<main>
  <div class="header">
    <div>
      {#if !$user}
        <span>Demo Data</span>
      {/if}
    </div>
    <div class="login">
      <Login bind:user={user} bind:data={data} />
    </div>
  </div>
  
  <div>
    {#if $data}
      <Table data={$data} />
    {/if}
  </div>

</main>

<style>
  div.header {
    display: flex;
    background-color: whitesmoke;
    border-bottom: 1px solid silver;
    width: 100%;
  }
  div.header div {
    padding: .2rem 1rem;
    vertical-align: middle;
    width: 50%;  
  }

  div.login {
    text-align: right;
  }
</style>
