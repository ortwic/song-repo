<script lang="ts">
    const year = new Date().getFullYear();
</script>

<footer>
    <a href="https://song-repo.web.app" target="_blank">
        <img src="logo.svg" alt="logo" width="20" />
        &copy; { year } Song Repo
    </a>
    <span>
        <slot></slot>
    </span>
    <a href="https://ortwic.github.io/" target="_blank">Made by 
        <img src="https://ortwic.github.io/assets/images/oc-fav.png" alt="logo" width="20" />    
        OCSoft42
    </a>
</footer>

<style lang="scss">
    footer {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        padding: 1em;
        gap: 0.2em;

        span, a {
            display: flex;
            align-items: center;
            gap: 0.2em;
        }
    }
</style>