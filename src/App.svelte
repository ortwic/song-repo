<script lang="ts">
    import Login from './components/login/Login.svelte';
    import Table from './components/table/SongTable.svelte';
</script>

<svelte:head>
	<link rel="stylesheet" href="node_modules/svelte-material-ui/bare.css"/>
</svelte:head>

<main>
  <div class="header">
    <div>
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
