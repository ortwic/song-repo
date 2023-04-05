<script lang="ts">
    import Switch from '@smui/switch';
    import Login from './lib/Login.svelte';
    import Board from './components/Board.svelte';
    import Table from './components/table/Table.svelte';
    import { Status, type Song } from './model/types';
  
    let data: Song[] = [
      { id: "1", title: "Fried Chicken", artist: "Jürgen Moser", status: Status.Todo, genre: 'Pop / Rock', tags: ["new"] },
      { id: "2", title: "Manhatten Skyline", artist: "Jürgen Moser", status: Status.Wip, genre: 'Rock Ballad', progress: 60, tags: [], fav: true },
      { id: "3", title: "Für Elise", artist: "Beethoven", status: Status.Done, genre: 'Classic', progress: 100, tags: [] },
      { id: "4", title: "Take 5", artist: "Dave Brubeck", genre: "Jazz", status: Status.Repeat, progress: 80, tags: ["improv", "lead sheet"] },
    ];

    // clone each entry or data affects kanban board in a strange way: "Error: {#each} only iterates over array-like objects."
    let tableData = data.map((value) => ({...value}));

    let showKanban = false;
</script>

<svelte:head>
	<link rel="stylesheet" href="node_modules/svelte-material-ui/bare.css"/>
</svelte:head>

<main>
  <div class="header">
    <div>
      Table
      <Switch icons={false} bind:checked={showKanban} />
      Kanban
    </div>
    <div class="login">
      <Login />
    </div>
  </div>
  
  <div>
    {#if showKanban}
    <Board {data} />
    {:else}
    <Table data={tableData} />
    {/if}
  </div>

</main>

<style>
  div.header {
    padding: .2rem 1rem;
    display: flex;
    background-color: whitesmoke;
    border-bottom: 1px solid silver;
    text-align: right;
  }

  div.login {
    float: right;
  }
</style>
