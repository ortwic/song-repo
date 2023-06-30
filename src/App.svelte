<script lang="ts">
    import Login from './components/login/Login.svelte';
    import Table from './components/table/SongTable.svelte';
</script>

<main>
  <div class="header">
    <Login />
  </div>
  
  <div>
    <Table />
  </div>

</main>

<style>
  div.header {
    position: fixed;
    right: 0;
    top: 0;
    z-index: 1;
    padding: .2rem 1rem;
  }
 
  @media (prefers-color-scheme: dark) {
  :root {
    color: whitesmoke;
    background-color: #404040;
  }
}
</style>
