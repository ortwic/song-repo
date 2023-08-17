<script>
    import { lang } from "../store/app.store";
    import messages from '../data/notfound.json';

    const no = Math.floor(Math.random() * messages[lang].length);
</script>

<div>
    <h2>404 - Not Found</h2>
    <p>
        {messages[lang][no]}
    </p>
    <p style="color: red">
        <slot></slot>
    </p>
</div>

<style>
    h2 {
        color: var(--primary);
    }

    div {
        margin: 1em;
    }
</style>