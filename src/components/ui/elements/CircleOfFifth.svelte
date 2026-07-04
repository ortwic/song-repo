<script lang="ts">
    interface Props {
        selectedKey?: string;
        size?: number;
    }

    let { selectedKey = $bindable(), size = 100 }: Props = $props();

    const majorKeys = [
        ['C'],
        ['G'],
        ['D'],
        ['A'],
        ['E'],
        ['B', 'H'],
        ['F♯', 'G♭', 'F#', 'Gb'],
        ['D♭', 'C♯', 'Db', 'C#'],
        ['A♭', 'G♯', 'Ab', 'G#'],
        ['E♭', 'D♯', 'Eb', 'D#'],
        ['B♭', 'A♯', 'Bb', 'A#'],
        ['F'],
    ];
    const minorKeys = [
        ['a', 'Am'],
        ['e', 'Em'],
        ['b', 'Bm', 'h', 'Hm'],
        ['f♯', 'F♯m', 'g♭', 'gb', 'f#', 'F#m', 'GBm', 'G♭m'],
        ['c♯', 'C♯m', 'd♭', 'db', 'c#', 'C#m', 'DBm', 'D♭m'],
        ['g♯', 'G♯m', 'a♭', 'ab', 'g#', 'G#m', 'ABm', 'A♭m'],
        ['e♭', 'E♭m', 'd♯', 'd#', 'eb', 'Ebm', 'D♯m', 'D#m'],
        ['b♭', 'B♭m', 'a♯', 'a#', 'bb', 'Bbm', 'A♯m', 'A#m'],
        ['f', 'Fm'],
        ['c', 'Cm'],
        ['g', 'Gm'],
        ['d', 'Dm'],
    ];

    const dblPi = 2 * Math.PI;
    const halfPi = 0.5 * Math.PI;
    const center = 0.5 * size;
    const outerRadius = 0.4 * size;
    const innerRadius = 0.6 * outerRadius;

    const calcX = (i: number, r: number) => center + r * Math.cos((dblPi * i) / 12 - halfPi);
    const calcY = (i: number, r: number) => center + r * Math.sin((dblPi * i) / 12 - halfPi);

    // Hilfsfunktion statt Array von Funktionen
    const select = (key: string) => (selectedKey = key);
</script>

<svg viewBox="0 0 {size} {size}">
    <circle class="outer" r={outerRadius * 1.2} cx={center} cy={center} stroke-width=".4" />
    <circle class="inner" r={innerRadius * 1.3} cx={center} cy={center} />
    <circle class="center" r={innerRadius * 0.7} cx={center} cy={center} stroke-width=".4" />

    {#each majorKeys as keys, idx}
        <!-- Minor Keys -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <g
            class="key"
            role="button"
            tabindex="0"
            class:selectedKey={minorKeys[idx].includes(selectedKey ?? '')}
            onclick={() => select(minorKeys[idx][1])}
        >
            <circle cx={calcX(idx, innerRadius)} cy={calcY(idx, innerRadius)} r={innerRadius * 0.24} />
            <text
                class="minor"
                x={calcX(idx, innerRadius)}
                y={calcY(idx, innerRadius)}
                text-anchor="middle"
                dominant-baseline="middle"
            >
                {minorKeys[idx][1]}
            </text>
        </g>

        <!-- Major Keys -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <g
            class="key"
            role="button"
            tabindex="0"
            class:selectedKey={keys.includes(selectedKey ?? '')}
            onclick={() => select(keys[0])}
        >
            <circle cx={calcX(idx, outerRadius)} cy={calcY(idx, outerRadius)} r={outerRadius * 0.18} />
            <text
                class="major"
                x={calcX(idx, outerRadius)}
                y={calcY(idx, outerRadius)}
                text-anchor="middle"
                dominant-baseline="middle"
            >
                {keys[0]}
            </text>
        </g>
    {/each}
</svg>

<style>
    circle.outer {
        fill: var(--surface-mid);
        stroke: var(--border);
    }

    circle.inner {
        font-size: smaller;
        fill: var(--surface-t);
    }

    circle.center {
        fill: var(--surface-light);
        stroke: var(--surface);
    }

    g.key,
    g.key text {
        cursor: pointer;
        fill: var(--text);
    }
    g.key > circle {
        fill: var(--surface-t);
    }
    g.key:hover > circle {
        fill: var(--surface);
        stroke: var(--accent);
        stroke-width: 0.5;
    }

    g.key > text.major {
        font-size: 0.5em;
        font-weight: 500;
    }
    g.key > text.minor {
        font-size: 0.35em;
    }

    g.selectedKey > circle,
    g.selectedKey:hover > circle {
        fill: var(--accent);
    }
    g.selectedKey > text,
    g.selectedKey:hover > text {
        fill: var(--surface);
    }

    .key circle {
        transition: fill 0.2s;
    }
</style>
