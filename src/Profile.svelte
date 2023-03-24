<script>
    export let displayName;
    export let photoURL;
    export let email;
    export let emailVerified;
</script>


<h2>
    <img src={ photoURL } width="50" alt="user avatar">
    <span>Hi <a href="mailto:{email}">{ displayName }</a>! { emailVerified ? '✔️' : '❌' }</span>
</h2> 

<style>
    h2 {
        display: inline-block;
    }

    img {
        vertical-align: middle;
        border-radius: 2em;
    }
</style>