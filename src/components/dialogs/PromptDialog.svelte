<script lang="ts">
    import { createBubbler, preventDefault } from 'svelte/legacy';

    const bubble = createBubbler();
    import { writable, type Readable } from "svelte/store";
    import ConfirmDialog from "./ConfirmDialog.svelte"
    
    type InputType = 'text' | 'numer' | 'date' | 'email' | 'url';
    interface Props {
        caption?: string;
        title?: string;
        type?: InputType;
        placeholder?: string;
        children?: import('svelte').Snippet;
    }

    let {
        caption = '',
        title = '',
        type = 'text',
        placeholder = '',
        children
    }: Props = $props();
    
    const store = writable<string>();
    let form: HTMLFormElement = $state();
    let input: HTMLInputElement = $state();
    let visible = $state(false);

    export function showDialog(initial = ''): Readable<string> {
        visible = true;
        store.set(initial);
        return store;
    }

    function handleDrop(event: DragEvent) {
        for (const item of event.dataTransfer.items) {
            if (item.kind === 'string') {
                item.getAsString(s => input.value = s);
            }
        }
    }

    function done({ detail: confirm }): void {
        if (!confirm) {
            visible = false;
            form.reset();
        } else if (form.checkValidity()) {
            store.set(input.value);
            visible = false;
            form.reset();
        }
    }
</script>

{#if visible}
<form bind:this={form} onsubmit={preventDefault(bubble('submit'))}>
    <ConfirmDialog size='auto' {title} on:closed={done}>
        {@render children?.()}
        <section aria-hidden="true"
            ondragover={preventDefault(() => { })} 
            ondragenter={preventDefault(() => { })} 
            ondragleave={preventDefault(() => { })}
            ondrop={preventDefault(handleDrop)}>
            <div class="section">
                <label for="prompt">{caption}</label>
                <input id="prompt" bind:this={input} {type} value={$store} {placeholder}/>
            </div>
        </section>
    </ConfirmDialog>
</form>
{/if}

<style lang="scss">
section {
    margin: 1em;

    div.section {
        padding-right: 1em;
        
        #prompt {
            width: 100%;
        }
    }
}
</style>