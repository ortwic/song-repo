<script lang="ts">
    import type { User } from 'firebase/auth';
    import type { Observable } from 'rxjs';
    import Login from './components/login/Login.svelte';
    import Table from './components/table/SongTable.svelte';
    import { songs } from './store/song.store';
  
    songs.set([
      { uid: "0", title: "Fried Chicken", artist: "Jürgen Moser", status: 'todo', genre: 'Rock', tags: [], fav: false },
      { uid: "0", title: "Interstellar", artist: "Hans Zimmer / Pietschmann", status: 'wip', genre: 'Movie Score', progress: 60, tags: ["new"], fav: true },
      { uid: "0", title: "Für Elise", artist: "L. Beethoven", status: 'done', genre: 'Classic', progress: 100, tags: [], fav: false },
      { uid: "0", title: "Take 5", artist: "Dave Brubeck", status: 'repeat', genre: "Jazz", progress: 80, tags: ["improv", "lead sheet"], fav: false },
    ]);

    let user: Observable<User>;
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
      <Login bind:user={user} />
    </div>
  </div>
  
  <div>
    <Table />
  </div>

</main>

<style>
  div.header {
    display: flex;
    color: black;
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
 
  @media (prefers-color-scheme: dark) {
  :root {
    color: whitesmoke;
    background-color: #404040;
  }
}
</style>
