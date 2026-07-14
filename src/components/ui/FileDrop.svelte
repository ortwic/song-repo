<script lang="ts">
    import { preventDefault } from 'svelte/legacy';

    import { showError } from '../../store/notification.store';
    interface Props {
        children?: import('svelte').Snippet;
        onEnter?: () => void;
        onAddJson?: (data: string) => void;
        onAddCsv?: (data: string) => void;
    }

    let { children, onEnter, onAddJson, onAddCsv }: Props = $props();

    function handleDrop(event: DragEvent) {
        event.preventDefault();

        for (const item of event.dataTransfer.items) {
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file.type === 'application/json') {
                    readFile(file, (data) => onAddJson(data));
                } else if (file.type === 'text/csv') {
                    readFile(file, (data) => onAddCsv(data));
                } else {
                    showError(`Unsupported file type: ${file.type}`);
                }
            }
        }
    }

    function readFile(file: File, action: (data: string) => void) {
        const reader = new FileReader();
        reader.onload = () => action(`${reader.result}`);
        reader.readAsText(file);
    }
</script>

<div
    title="Drop file here to import data"
    aria-hidden="true"
    ondragover={preventDefault(() => {})}
    ondragenter={preventDefault(() => onEnter())}
    ondragleave={preventDefault(() => {})}
    ondrop={handleDrop}
>
    {@render children?.()}
</div>

<style>
    div {
        height: 100%;
        overflow: hidden;
    }
</style>
