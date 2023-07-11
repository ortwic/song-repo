import { fade, slide, type SlideParams } from 'svelte/transition';
import { cubicOut } from 'svelte/easing';

export const slideFade = (
    node: Element,
    { delay = 0, duration = 400 }: SlideParams
) => ({
    delay,
    duration,
    css: (t: number, u: number) => {
        const slideTransition = slide(node, {
            delay,
            duration,
            easing: cubicOut,
        });
        const fadeTransition = fade(node, {
            delay,
            duration,
            easing: cubicOut,
        });
        return `${slideTransition.css(t, u)} ${fadeTransition.css(t, u)}`;
    },
});
