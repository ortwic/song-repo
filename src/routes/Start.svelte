<script>
    import { marked } from 'marked';
    import welcome from '../data/welcome.json';
    import { lang } from '../store/app.store';
    
    const options = { mangle: false, headerIds: false };
</script>

<div id='welcome'>
    <h2>{@html marked(welcome[lang][0], options)}</h2>
    <p>
        {@html marked(welcome[lang][1], options)}
    </p>
    <a href="#/samples">{welcome[lang][2]}</a>
    <p>
        <i class='bx bx-error'></i>
        <i>{welcome[lang][3]}</i>
        <i class='bx bx-error'></i>
    </p>
</div>

<style lang="scss">
#welcome {
    padding: 1em 5%;
    color: var(--text);
    font-weight: normal;
    text-align: left;
    max-width: 40em;
    height: 100%;
    overflow-y: auto;

    a, h1, h2 {
        color: var(--primary);

        i, em {
            text-decoration: underline;
            color: var(--primary);
        }
    }

    a:hover {
        text-decoration: underline;
    }

    i, em {
        color: var(--primselect);
    }
}
</style>