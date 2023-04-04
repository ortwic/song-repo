<script lang="ts">
  import Login from './lib/Login.svelte'
  import Board from './components/Board.svelte';
  import { Status, type Song } from './types';
  
  let data: Song[] = [
      { id: "1", title: "Fried Chicken", artist: "Jürgen Moser", status: Status.Todo, genre: 'Pop / Rock', tags: ["new"] },
      { id: "2", title: "Manhatten Skyline", artist: "Jürgen Moser", status: Status.Wip, genre: 'Rock Ballad', progress: .6, tags: [] },
      { id: "3", title: "Für Elise", artist: "Beethoven", status: Status.Done, genre: 'Classic', progress: 1, tags: [] },
      { id: "4", title: "Take 5", artist: "Dave Brubeck", genre: "Jazz", status: Status.Repeat, progress: .8, tags: ["improv", "lead sheet"] },
    ];
</script>

<svelte:head>
	<link rel="stylesheet" href="node_modules/svelte-material-ui/bare.css"/>
</svelte:head>

<main>
  <div class="card">
    <Login />
  </div>
  
  <div class="card">
    <Board {data} />
  </div>

</main>

<style>
  
</style>
