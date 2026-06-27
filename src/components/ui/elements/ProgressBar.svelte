<script lang="ts">
    import { Tween } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
    import '../../wc/ProgressBar.component';

    interface Props {
        value?: number;
        delta?: number;
        initialValue?: number;
        initialDelta?: number;
        min?: number;
        max?: number;
        disabled?: boolean;
        animationDurationMs?: number;
        onChange?: (newValue: number, oldValue: number) => void;
    }

    let {
        value = $bindable(0),
        delta = $bindable(0),
        initialValue = $bindable(0),
        initialDelta = $bindable(0),
        animationDurationMs = 400,
        min = 0,
        max = 100,
        disabled = false,
        onChange
    }: Props = $props();

    let fromUser = false;
    let animatingCount = 0;
    const valueTween = new Tween(initialValue, { duration: animationDurationMs, easing: cubicOut });
    $effect(() => {
        animatingCount++;
        const duration = fromUser ? 0 : animationDurationMs;
        valueTween.set(value, { duration }).then(() => animatingCount--);
        fromUser = false;
    });

    const deltaTween = new Tween(initialDelta, { duration: animationDurationMs, easing: cubicOut });
    $effect(() => {
        animatingCount++;
        deltaTween.set(delta).then(() => animatingCount--);
    });

    function changeHandler({ detail }: CustomEvent<number[]>): void {
        if (animatingCount < 1) {
            const [newValue, oldValue] = detail;
            onChange?.(newValue, oldValue);
            fromUser = true;
            value = newValue;
        }
    }
</script>

<!-- The whole point of this wrapper is that svelte 5 
     does not support CustomEvents from WebComponents -->
<!-- svelte-ignore event_directive_deprecated -->
<progress-bar {max} {min} {disabled}
    value={valueTween.current}
    delta={deltaTween.current}
    on:change={changeHandler}
>
</progress-bar>