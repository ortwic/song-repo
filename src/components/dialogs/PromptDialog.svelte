<script lang="ts">
    import { createBubbler, preventDefault } from 'svelte/legacy';

    const bubble = createBubbler();
    import ConfirmDialog from "./ConfirmDialog.svelte"
    import { createDeferred } from '../../utils/promise.helper';
    
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
    
    let result = $state('');
    const { promise, resolve } = createDeferred<string>();
    let form: HTMLFormElement = $state();
    let input: HTMLInputElement = $state();
    let visible = $state(false);

    export function showDialog(initial = ''): Promise<string> {
        visible = true;
        result = initial;
        return promise;
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
            resolve(null);
        } else if (form.checkValidity()) {
            resolve(input.value);
        } else {
            return;
        }

        visible = false;
        form.reset();
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
                <input id="prompt" bind:this={input} {type} bind:value={result} {placeholder}/>
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