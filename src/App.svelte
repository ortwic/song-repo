<script lang="ts">
    import Login from './components/login/Login.svelte';
    import Table from './components/table/SongTable.svelte';
    import { currentUser } from './service/auth.service';
    import { songs } from './store/song.store';
  
    function demo() {
      songs.set([
        { id: "rock_piano_fried_chicken", uid: "0", title: "Fried Chicken", artist: "Jürgen Moser", status: 'todo', genre: 'Rock', tags: [], fav: false },
        { id: "p_pietschmann_interstellar", uid: "0", title: "Interstellar", artist: "Hans Zimmer / Pietschmann", status: 'wip', genre: 'Movie Score', progress: 60, tags: ["new"], fav: true },
        { id: "l_beethoven_fr_elisec", uid: "0", title: "Für Elise", artist: "L. Beethoven", status: 'done', genre: 'Classic', progress: 100, tags: [], fav: false },
        { id: "d_brubeck_take_5", uid: "0", title: "Take 5", artist: "Dave Brubeck", status: 'repeat', genre: "Jazz", progress: 80, tags: ["improv", "lead sheet"], fav: false },
      ]);
    }
</script>

<svelte:head>
	<link rel="stylesheet" href="node_modules/svelte-material-ui/bare.css"/>
</svelte:head>

<main>
  <div class="header">
    <div>
      {#if !$currentUser}
        <a href="#/" role="button" on:click|preventDefault={demo}>Demo Data</a>
      {/if}
    </div>
    <div class="login">
      <Login />
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
