<script lang="ts">
  import Table from './components/table/SongTable.svelte';
  import Sidebar from './components/sidebar/Sidebar.svelte'
  import BurgerButton from './components/ui/BurgerButton.svelte';
</script>

<svelte:head>
  <title>{import.meta.env.DEV ? 'DEBUG Song Repo' : 'My Song Repertoire'}</title>
</svelte:head>

<header>
  <BurgerButton />
</header>

<nav>
  <Sidebar version='0.1.0 pre-alpha' />
</nav>

<main> 
  <Table />
</main>

<style>
  header {
    position: sticky;
    top: 1rem;
    margin-right: 1rem;
    z-index: 10;
    height: 0;
    text-align: right;
  }

  main {
    height: 100vh;
    overflow: hidden;
  }
 
</style>
