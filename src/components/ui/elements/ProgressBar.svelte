<script lang="ts">
    import '../../web/ProgressBar.component';

    interface Props {
        value?: number;
        min?: number;
        max?: number;
        disabled?: boolean;
        onChange?: (newValue: number, oldValue: number) => void;
    }

    let { 
        value = $bindable(0),
        min = 0,
        max = 100,
        disabled = false,
        onChange
     }: Props = $props();


    function change({ detail }: CustomEvent<number[]>): void {
        const [newValue, oldValue] = detail;
        onChange?.(newValue, oldValue);
        value = newValue;
    }
</script>

<!-- The whole point of this wrapper is that svelte 5 
     does not support CustomEvents from WebComponents -->

<!-- svelte-ignore event_directive_deprecated -->
<progress-bar {max} {min} {value} {disabled} on:change={change}>
</progress-bar>