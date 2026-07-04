<script lang="ts">
    import CircleOfFifth from "./elements/CircleOfFifth.svelte";
    import PopupMenu from "./PopupMenu.svelte";

    interface Props {
        id?: string;
        value: string;
    }

    let { id, value = $bindable() }: Props = $props();
    let popup: ReturnType<typeof PopupMenu>;

    $effect(() => {
        if (value) {
            popup?.hide();
        }
    });
</script>

<div class="combobox-anchor">
    <input
        {id}
        type="text"
        readonly
        class="input sm"
        bind:value
        onclick={() => popup.showPopupMenu()}
    />

    <PopupMenu bind:this={popup} position="absolute" width="16em">
        <div class="popup">
            <CircleOfFifth size={120} bind:selectedKey={value} />
        </div>
    </PopupMenu>
</div>

<style>
    .combobox-anchor {
        position: relative;
        display: inline-block;
        width: 100%;
    }

    div.popup {
        width: 16em;
    }
</style>