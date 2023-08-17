<script lang='ts'>
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
    section { 
        padding: 1em 10%; 
        flex-grow: 1;
        hyphens: auto; 
        overflow: hidden auto;
        height: calc(100% - 2em);
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

<section class="dialog">
    {#if !sent}
    <div class="section">
        <p>Direkt an ocsoft42@gmail.com schreiben oder</p>
        <h2>E-Mail mit diesem Formular vorbereiten</h2>
        <p>Bitte bewerte die Folgenden Fragen auf einer Skala von 1 bis 10 aufsteigend, wobei 10 dir am aller wichtigsten ist.</p>
        <h4>1. Wie wichtig ist es dir, Daten importieren oder exportieren zu können?</h4>
        <div class="flex">
            <span><input type="checkbox" name="imcsv" bind:checked={imcsv}> Import CSV</span>
            <span><input type="checkbox" name="excsv" bind:checked={excsv}> Export CSV</span>
            <span><input type="checkbox" name="xlsx" bind:checked={xlsx}> Export XLSX</span>
            <span><input type="checkbox" name="pdf" bind:checked={pdf}> Export PDF</span>
        </div>
        <h4>2. Wie wichtig ist es dir, dass dir bei der Erstellung neuer Stücke Daten vorgeschlagen werden?</h4>
        <ul>
            <li><input type="number" placeholder="1-10" name="genre" bind:value={genre} min="1" max="10"> <label for="genre">Genre</label></li>
            <li><input type="number" placeholder="1-10" name="artist" bind:value={artist} min="1" max="10"> <label for="artist">Künstler</label></li>
            <li><input type="number" placeholder="1-10" name="title" bind:value={title} min="1" max="10"> <label for="">Titel</label></li>
            <li><input type="number" placeholder="1-10" name="lyrics" bind:value={lyrics} min="1" max="10"> <label for="">Verweis Lyrics</label></li>
            <li><input type="number" placeholder="1-10" name="chords" bind:value={chords} min="1" max="10"> <label for="">Verweis Akkorde</label></li>
            <li><input type="number" placeholder="1-10" name="notes" bind:value={notes} min="1" max="10"> <label for="">Suche nach Noten</label></li>
            <li><input type="text" name="others" bind:value={others}> <label for="">Sonstiges</label></li>
        </ul>
        <h4>3. Wie wichtig ist es für dich, deine Inhalte mit anderen Benutzern teilen zu können?</h4>
        <ul>
            <li><input type="number" placeholder="1-10" name="link" bind:value={link} min="1" max="10"> <label for="">Öffentlicher Link</label></li>
            <li><input type="number" placeholder="1-10" name="user" bind:value={user} min="1" max="10"> <label for="">Andere Benutzer der Plattform</label></li>
            <li><input type="number" placeholder="1-10" name="email" bind:value={email} min="1" max="10"> <label for="">E-Mail Versand</label></li>
            <li><input type="text" name="platform" bind:value={platform}> <label for="">Sonstige Plattform </label></li>
        </ul>
        <h4>4. Hast du noch sonstige Ideen und Vorschläge für die App oder sind dir schwerwiegende Bugs aufgefallen?</h4>
        <textarea name="ideas" bind:value={ideas} rows="4" cols="50"></textarea><br>
    </div>
    <div class="section">
        <button on:click={handleForm}>
            <span><i class='bx bx-mail-send'></i> E-Mail vorbereiten</span>
        </button>
    </div>
    {:else}
    <p>Danke, dass du an dieser Feedback Befragung teil genommen hast. </p>
    {/if}
</section>
