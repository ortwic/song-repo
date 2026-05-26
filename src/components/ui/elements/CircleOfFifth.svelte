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
        ['f♯', 'g♭', 'gb', 'f#', 'F♯m', 'F#m', 'GBm', 'G♭m'],
        ['c♯', 'd♭', 'db', 'c#', 'C♯m', 'C#m', 'DBm', 'D♭m'],
        ['g♯', 'a♭', 'ab', 'g#', 'G♯m', 'G#m', 'ABm', 'A♭m'],
        ['e♭', 'd♯', 'd#', 'eb', 'E♭m', 'Ebm', 'D♯m', 'D#m'],
        ['b♭', 'a♯', 'a#', 'bb', 'B♭m', 'Bbm', 'A♯m', 'A#m'],
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
    <circle r={outerRadius * 1.2} cx={center} cy={center} fill="Gainsboro" stroke="Silver" stroke-width=".4" />
    <circle r={innerRadius * 1.3} cx={center} cy={center} fill="WhiteSmoke" />
    <circle r={innerRadius * 0.7} cx={center} cy={center} fill="white" stroke="Gainsboro" stroke-width=".4" />

    {#each majorKeys as keys, idx}
        <!-- Minor Keys -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <g
            class="key"
            role="button"
            tabindex="0"
            class:selectedKey={minorKeys[idx].includes(selectedKey ?? '')}
            onclick={() => select(minorKeys[idx][0])}
        >
            <circle cx={calcX(idx, innerRadius)} cy={calcY(idx, innerRadius)} r={innerRadius * 0.24} />
            <text
                class="minor"
                x={calcX(idx, innerRadius)}
                y={calcY(idx, innerRadius)}
                text-anchor="middle"
                dominant-baseline="middle"
            >
                {minorKeys[idx][0]}
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
    g.key,
    g.key text {
        cursor: pointer;
    }
    g.key > circle {
        fill: #a0a0a060;
    }
    g.key:hover > circle {
        fill: var(--surface);
        stroke: gray;
        stroke-width: 0.2;
    }

    g.key > text.major {
        font-size: 0.5em;
        font-weight: 500;
    }
    g.key > text.minor {
        font-size: 0.4em;
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
