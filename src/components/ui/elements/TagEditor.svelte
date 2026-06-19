<script lang="ts">
    import { t } from 'svelte-i18n';
    import { tick } from 'svelte';
    import { confirmed } from '../helper/input.helper';

    interface Props {
        labels: string[];
        onChange?: (labels: string[]) => void;
    }

    let { 
        labels = $bindable([]), 
        onChange 
    }: Props = $props();

    let editRefs: Array<HTMLElement | null> = $state([]);

    async function add() {
        labels = [...labels, ''];

        await tick();
        const el = editRefs[labels.length - 1];
        el?.focus();
    }

    function update(event: Event & { currentTarget: EventTarget & HTMLSpanElement }, i: number) {
        labels[i] = event.currentTarget.innerText;
        onChange?.(labels);
        event.currentTarget.blur();
    }

    function remove(tag: string) {
        labels = labels.filter((t) => t !== tag);
        onChange?.(labels);
    }
</script>

<div class="tag-cloud">
    {#each labels as value, i}
        <span class="label">
            {#key value}
            <span
                tabindex="{i}"
                role="textbox"
                contenteditable="true"
                bind:this={editRefs[i]}
                onkeyup={(ev) => confirmed(ev) && update(ev, i)}
                onblur={(ev) => update(ev, i)}
            >
                {value}
            </span>
            {/key}
            <button class="clear remove" title={$t('settings.remove')} onclick={() => remove(value)}>
                <i class="icon bx bx-x"></i>
            </button>
        </span>
    {/each}
    <button class="clear" title={$t('settings.add')} onclick={add}>
        <i class="icon bx bx-plus"></i>
    </button>
</div>

<style>
    .tag-cloud {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    span[contenteditable='true'] {
        cursor: text;
        outline: none;
    }

    .label {
        padding-right: .2em;
    }

    .remove {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0 0 0 0.4em;
    }
</style>
