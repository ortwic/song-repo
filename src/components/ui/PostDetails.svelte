<script lang="ts">
    import { slide } from 'svelte/transition';
    import { logPageView } from '../../store/notification.store';
    
    export let title: string;
    export let html: string;
    export let collapsed = true;

    function toggle() {
        collapsed = !collapsed;
        if (!collapsed) {            
            logPageView({ page: 'blog', title });
        }
    }

    function generateSnippet(html: string, minWords = 3, maxWords = 12): string {
        const getWords = (s) => s.split(/[\s\n]/).filter(v => v);

        const text = html.replace(/<[^>]+>/g, ' ');
        if (text) {
            const sentences = text.match(/(.+[\.\?\!\n])\s/g)
                ?.filter(s => s)
                ?.map(s => `${s?.trim()}`)
            if (sentences?.length) {
                // console.log(sentences)
                const words = getWords(sentences[0]);
                if (words.length < minWords) {
                    words.push(...getWords(sentences[1]));
                }

                if (words.length > maxWords) {
                    return words.splice(0, maxWords).join(' ') + '...';
                }

                return words.join(' ') + '...';
            }
        }
        return '';
    }

    function parseHtml(html: string) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const content = [];
        for(const element of doc.querySelectorAll('*')) {
            const text = (element as HTMLElement).innerText;
            if (text) {
                content.push(text);
            }
        }
        return content.filter(v => v);
    }
</script>

<h2>{title}</h2>
{#if collapsed}
    <summary in:slide={{ duration: 200 }} out:slide={{ duration: 200 }}>
        <span>{@html generateSnippet(html)}</span>
        <button class="more" on:click|preventDefault={toggle}>read more</button>
    </summary>
{:else}
<div in:slide={{ duration: 200 }} out:slide={{ duration: 200 }} >
    {@html html}
    <div>
        <button class="more" on:click|preventDefault={toggle}>show less</button>
    </div> 
</div>
{/if}

<style>
    h2 {
        display: inline-block;
        margin: .3em 0;
        width: 100%;
        transition: all .2s ease-in-out;
    }

    button.more {
        padding: 0;
        border: 0;
        background-color: transparent;
        box-shadow: unset;
        text-align: left;

        &::before {
            content: '[';
            padding-right: 2px;
        }

        &::after {
            content: ']';
            padding-left: 2px;
        }
    }
</style>