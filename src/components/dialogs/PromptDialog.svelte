<script lang="ts">
    import { preventDefault } from 'svelte/legacy';
    import ConfirmDialog from "./ConfirmDialog.svelte";
    import { createDeferred } from '../../utils/promise.helper';

    type InputType = 'text' | 'number' | 'date' | 'email' | 'url';

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
        children,
    }: Props = $props();

    let result = $state('');
    let form: HTMLFormElement = $state();
    let input: HTMLInputElement = $state();
    let visible = $state(false);

    let deferred: ReturnType<typeof createDeferred<string>> | null = null;

    export function showDialog(initial = ''): Promise<string> {
        deferred = createDeferred<string>();
        result = initial;
        visible = true;
        return deferred.promise;
    }

    function done(confirm: boolean): void {
        if (deferred) {
            if (!confirm) {
                deferred.resolve(null);
            } else {
                deferred.resolve(input.value);
            }

            visible = false;
            form.reset();
            deferred = null;
        }
    }

    function handleDrop(event: DragEvent) {
        for (const item of event.dataTransfer.items) {
            if (item.kind === 'string') {
                item.getAsString(s => (input.value = s));
            }
        }
    }
</script>

<form bind:this={form} onsubmit={preventDefault(bubble('submit'))}>
    <ConfirmDialog size='auto' {title} {visible} onClose={done}>
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