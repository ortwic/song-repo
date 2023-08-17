<script>
    import { marked } from 'marked';
    import Titlebar from '../components/ui/elements/Titlebar.svelte';
    import welcome from '../data/welcome.json';
    import { lang } from '../store/app.store';
    
    const options = { mangle: false, headerIds: false };
</script>

<main class="content">
    <Titlebar closable={false}>{welcome[lang][0]}</Titlebar>
    <p>
        {welcome[lang][1]}
        {@html marked(welcome[lang][2], options)}
    </p>
    <p>
        <a role="button" class="primary" href="#/songs">
            <span><i class='bx bxs-playlist'></i> Start</span>
        </a>
        <a role="button" class="none" href="#/samples">
            <span><i class='bx bx-test-tube'></i> {welcome[lang][3]}</span>
        </a>
    </p>
    <p>
        <i class='bx bx-error'></i>
        <i>{welcome[lang][4]}</i>
        <i class='bx bx-error'></i>
    </p>
</main>

<style lang="scss">
main {
    p {
        padding: 1em 5%;
        max-width: 40em;

        a.none {
            box-shadow: unset;
        }

        a:not([role="button"]), h1, h2 {
            color: var(--primary);

            i, em {
                text-decoration: underline;
                color: var(--primary);
            }
        }

        a:not([role="button"]):hover {
            text-decoration: underline;
        }

        i, em {
            color: var(--primselect);
        }
    }
}
</style>