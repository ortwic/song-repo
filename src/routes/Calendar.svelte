<script lang="ts">
    import { t } from "svelte-i18n";

    let src = 'https://calendar.google.com/calendar/embed?height=600&wkst=2&bgcolor=%23616161&ctz=Europe%2FBerlin&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=1&showCalendars=0&showTz=1&src=b2Nzb2Z0NDJAZ21haWwuY29t&src=NjJiZjE2MDNmODU3Y2Y0MzgzZmYyYWUxZmNjNzhjNjE1YTQ4NmFiODI4ZWEwNmU0ZmI1OTUyMjI2MzhmZTg1NUBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&src=ZGUuZ2VybWFuI2hvbGlkYXlAZ3JvdXAudi5jYWxlbmRhci5nb29nbGUuY29t&color=%23039BE5&color=%237CB342&color=%230B8043';
</script>

<svelte:head>
   <title>{ $t('calendar.title') } | Song Repertory</title>
</svelte:head>

<main>
   <iframe title={ $t('calendar.title') } {src} frameborder="0" scrolling="no"></iframe>
</main>

<style>
    iframe {
        border: 0;
        width: 100%;
        height: 100%;
    }
</style>