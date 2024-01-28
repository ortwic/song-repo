<script lang="ts">
    import { onMount } from "svelte";
    import { pop } from "svelte-spa-router";
    import Start from "./Start.svelte";
    import { currentMenu } from "../store/app.store";

    onMount(() => currentMenu.set('signup'));

    if ($currentMenu !== 'signup') {
        pop();
    }

</script>

<Start />