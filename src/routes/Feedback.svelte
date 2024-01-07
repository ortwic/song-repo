<script lang='ts'>
    import { t } from 'svelte-i18n';
    import { format } from 'fecha';
    import Titlebar from "../components/ui/elements/Titlebar.svelte";
    import FirestoreService from "../service/firestore.service";
    import { showError } from '../store/notification.store';

    const store = new FirestoreService('feedback');
    let sent = false;

    async function handleForm({ target }) {
        const data = new FormData(target);
        const json = Object.fromEntries(data.entries()) as { id: string };
        console.table(json)
        
        try {
            // await store.setDocument(json);
        } catch (error) {
            showError(error);
        }

        sent = true;
    }
</script>

<style lang="scss">
    div.section { 
        padding: 1em 10%; 
    }
    input[type=number] { 
        width: 3.6em; 
    }
    textarea { 
        width: 100%; 
        min-height: 8em; 
    }
    ul {
        list-style: none;

        li {
            display: flex;
            text-align: left;
            white-space: nowrap;
        }
    }

    fieldset {
        border-color: whitesmoke;
        border-left: 0;
        border-right: 0;
        border-bottom: 0;
        margin-bottom: 1em;

        legend {
            font-weight: 500;
            padding: 0 .6em;
        }
    }
</style>

<main class="content dialog">
    <Titlebar closable={false}><i class="bx bx-mail-send"></i>&nbsp; { $t('feedback.submit')}</Titlebar>
    <form on:submit|preventDefault={handleForm}>
        <div class="section">
            {#if !sent}
            <p>{ $t('feedback.note')}</p>
            <input type="hidden" name="id" value={format(new Date(), 'YYMMDD.HHmmss.SSS')}>
            <fieldset name="backup">
                <legend>{ $t('feedback.qBackup')}</legend>
                <div class="flex">
                    <span><input type="checkbox" name="import-csv"> Import CSV</span>
                    <span><input type="checkbox" name="export-csv"> Export CSV</span>
                    <span><input type="checkbox" name="export-xlsx"> Export XLSX</span>
                    <span><input type="checkbox" name="export-pdf"> Export PDF</span>
                </div>
            </fieldset>
            <fieldset name="search">
                <legend>{ $t('feedback.qSearch')}</legend>
                <ul>
                    <li><input type="number" placeholder="1-10" name="search-genre" min="1" max="10"> <label for="search-genre">{ $t('feedback.genre')}</label></li>
                    <li><input type="number" placeholder="1-10" name="search-title" min="1" max="10"> <label for="search-title">{ $t('feedback.title')}</label></li>
                    <li><input type="number" placeholder="1-10" name="search-lyrics" min="1" max="10"> <label for="search-lyrics">{ $t('feedback.refLyrics')}</label></li>
                    <li><input type="number" placeholder="1-10" name="search-chords" min="1" max="10"> <label for="search-chords">{ $t('feedback.refChords')}</label></li>
                    <li><input type="number" placeholder="1-10" name="search-notes" min="1" max="10"> <label for="search-notes">{ $t('feedback.searchNotes')}</label></li>
                    <li><input type="text" placeholder={ $t('feedback.other')} name="search-others"></li>
                </ul>
            </fieldset>
            <fieldset name="share">
                <legend>{ $t('feedback.qShare')}</legend>
                <ul>
                    <li><input type="number" placeholder="1-10" name="share-link" min="1" max="10"> <label for="share-link">{ $t('feedback.pubLink')}</label></li>
                    <li><input type="number" placeholder="1-10" name="share-within" min="1" max="10"> <label for="share-within">{ $t('feedback.otherUsers')}</label></li>
                    <li><input type="number" placeholder="1-10" name="share-email" min="1" max="10"> <label for="share-email">{ $t('feedback.emailSend')}</label></li>
                    <li><input type="text" placeholder={ $t('feedback.other')} name="share-others"></li>
                </ul>
            </fieldset>
            <fieldset name="blog">
                <legend>{ $t('feedback.qBlog')}</legend>
                <ul>
                    <li><input type="number" placeholder="1-10" name="blog-howto" min="1" max="10"> <label for="share-link">{ $t('feedback.blogHowto')}</label></li>
                    <li><input type="number" placeholder="1-10" name="blog-refs" min="1" max="10"> <label for="share-within">{ $t('feedback.blogRefs')}</label></li>
                    <li><input type="number" placeholder="1-10" name="blog-theory" min="1" max="10"> <label for="share-email">{ $t('feedback.blogTheory')}</label></li>
                    <li><input type="text" placeholder={ $t('feedback.other')} name="blog-others"></li>
                </ul>
            </fieldset>
            <fieldset>
                <legend>{ $t('feedback.qOther')}</legend>
                <textarea required name="message" rows="4" cols="50"></textarea>
                <p>
                    <button type="submit">
                        <span><i class='bx bx-mail-send'></i> { $t('feedback.submit')}</span>
                    </button>
                </p>
            </fieldset>
            {:else}
            <p>{ $t('feedback.ty')}</p>
            {/if}
        </div>
    </form>
</main>

