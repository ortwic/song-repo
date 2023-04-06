<script lang="ts">
    import Button, {Icon } from "@smui/icon-button";

    export let displayName: string;
    export let photoURL: string;
    export let email: string;

    const title = `${displayName} <${email}>`
</script>


<div>
    <img src={ photoURL } width="50" alt={title} {title}>
</div> 

<style>
    div {
        display: inline-block;
    }

    img {
        vertical-align: middle;
        border-radius: 2em;
    }
</style>