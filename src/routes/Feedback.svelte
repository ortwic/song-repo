<script lang='ts'>
    import Titlebar from "../components/ui/elements/Titlebar.svelte";
    import { t } from '../service/i18n';

    let sent = false;
    let imcsv = false;
    let excsv = false;
    let xlsx = false;
    let pdf = false;
    
    let genre = '';
    let artist = '';
    let title = '';
    let lyrics = '';
    let chords = '';
    let notes = '';
    let others = '';

    let link = '';
    let user = '';
    let email = '';
    let platform = '';

    let ideas = '';

    function handleForm() {
        let subject = "User Feedback for 'My Song Repertory'";
        let body = `
        Import CSV: ${imcsv}
        Export CSV: ${excsv}
        Export XLSX: ${xlsx}
        Export PDF: ${pdf}

        Autocomplete:
        Genre: ${genre}
        Künstler: ${artist}
        Titel: ${title}
        Verweis Lyrics: ${lyrics}
        Verweis Akkorde: ${chords}
        Suche nach Noten: ${notes}
        Sonstiges: ${others}

        Sharing:
        Link: ${link}
        User: ${user}
        E-Mail: ${email}
        Platform: ${platform}

        Sonstige Ideen und Vorschläge: ${ideas}`;

        window.open(`mailto:ocsoft42@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);

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
</style>

<main class="content dialog">
    <Titlebar closable={false}><i class="bx bx-mail-send"></i>&nbsp; { $t('feedback.submit')}</Titlebar>
    {#if !sent}
    <div class="section">
        <p>{ $t('feedback.note')}</p>
        <h4>{ $t('feedback.dataImpExp')}</h4>
        <div class="flex">
            <span><input type="checkbox" name="imcsv" bind:checked={imcsv}> { $t('feedback.ImpCsv')}</span>
            <span><input type="checkbox" name="excsv" bind:checked={excsv}> { $t('feedback.ExpCsv')}</span>
            <span><input type="checkbox" name="xlsx" bind:checked={xlsx}> { $t('feedback.ExpXlsx')}</span>
            <span><input type="checkbox" name="pdf" bind:checked={pdf}> { $t('feedback.ExpPdf')}</span>
        </div>
        <h4>{ $t('feedback.dataSug')}</h4>
        <ul>
            <li><input type="number" placeholder="1-10" name="genre" bind:value={genre} min="1" max="10"> <label for="genre">{ $t('feedback.genre')}</label></li>
            <li><input type="number" placeholder="1-10" name="artist" bind:value={artist} min="1" max="10"> <label for="artist">{ $t('feedback.artist')}</label></li>
            <li><input type="number" placeholder="1-10" name="title" bind:value={title} min="1" max="10"> <label for="">{ $t('feedback.title')}</label></li>
            <li><input type="number" placeholder="1-10" name="lyrics" bind:value={lyrics} min="1" max="10"> <label for="">{ $t('feedback.refLyrics')}</label></li>
            <li><input type="number" placeholder="1-10" name="chords" bind:value={chords} min="1" max="10"> <label for="">{ $t('feedback.refChords')}</label></li>
            <li><input type="number" placeholder="1-10" name="notes" bind:value={notes} min="1" max="10"> <label for="">{ $t('feedback.searchNotes')}</label></li>
            <li><input type="text" name="others" bind:value={others}> <label for="">{ $t('feedback.other')}</label></li>
        </ul>
        <h4>{ $t('feedback.shareCont')}</h4>
        <ul>
            <li><input type="number" placeholder="1-10" name="link" bind:value={link} min="1" max="10"> <label for="">{ $t('feedback.pubLink')}</label></li>
            <li><input type="number" placeholder="1-10" name="user" bind:value={user} min="1" max="10"> <label for="">{ $t('feedback.otherUsers')}</label></li>
            <li><input type="number" placeholder="1-10" name="email" bind:value={email} min="1" max="10"> <label for="">{ $t('feedback.emailSend')}</label></li>
            <li><input type="text" name="platform" bind:value={platform}> <label for="">{ $t('feedback.otherPlat')}</label></li>
        </ul>
        <h4>{ $t('feedback.ideas')}</h4>
        <textarea name="ideas" bind:value={ideas} rows="4" cols="50"></textarea><br>
    </div>
    <div class="section">
        <button on:click={handleForm}>
            <span><i class='bx bx-mail-send'></i> { $t('feedback.submit')}</span>
        </button>
    </div>
    {:else}
    <p>{ $t('feedback.ty')}</p>
    {/if}
</main>

