<script lang="ts">
    import Login from './components/login/Login.svelte';
    import Table from './components/table/SongTable.svelte';
</script>

<header>
  <Login />
</header>

<main> 
  <Table />
</main>

<style>
  header {
    position: sticky;
    top: 1rem;
    margin-right: 1rem;
    z-index: 1;
    height: 0;
    text-align: right;
  }

  main {
    height: 100vh;
    overflow: hidden;
  }
 
  @media (prefers-color-scheme: dark) {
  :root {
    color: whitesmoke;
    background-color: #404040;
  }
}
</style>
