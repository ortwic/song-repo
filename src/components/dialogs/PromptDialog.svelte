<script lang="ts">
    import { writable, type Readable } from "svelte/store";
    import ConfirmDialog from "./ConfirmDialog.svelte"
    
    type InputType = 'text' | 'numer' | 'date' | 'email' | 'url';
    export let caption = '';
    export let title = '';
    export let type: InputType = 'text';
    export let placeholder = '';
    
    const store = writable<string>();
    let form: HTMLFormElement;
    let input: HTMLInputElement;
    let visible = false;

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
<form bind:this={form} on:submit|preventDefault>
    <ConfirmDialog size='auto' {title} on:closed={done}>
        <slot></slot>
        <section aria-hidden="true"
            on:dragover|preventDefault="{() => { }}" 
            on:dragenter|preventDefault="{() => { }}" 
            on:dragleave|preventDefault="{() => { }}"
            on:drop|preventDefault="{handleDrop}">
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