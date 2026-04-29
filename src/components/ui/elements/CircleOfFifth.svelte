<script lang="ts">
    import { createEventDispatcher } from "svelte";

  interface Props {
    selectedKey?: string;
    size?: number;
  }

  let { selectedKey = $bindable(''), size = 100 }: Props = $props();
  
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
      ['F']
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
      ['d', 'Dm']
    ];
  
    const dblPi = 2 * Math.PI;
    const halfPi = .5 * Math.PI;
    const center = .5 * size;
    const outerRadius = .4 * size;
    const innerRadius = .6 * outerRadius;
    const lgCircleRadius = outerRadius * 1.2;
    const mdCircleRadius = innerRadius * 1.3;
    const smCircleRadius = innerRadius * .7;
    const outerItemRadius = outerRadius * .18;
    const innerItemRadius = innerRadius * .24;
    const calcX = (i: number, r: number) => center + r * Math.cos(dblPi * i / 12 - halfPi);
    const calcY = (i: number, r: number) => center + r * Math.sin(dblPi * i / 12 - halfPi);
    const dispatcher = createEventDispatcher();
    const changeKey = (key: string) => {
        selectedKey = key;
        dispatcher('changed', key);
    };
  </script>
  
  <style>
    g.key, g.key text { 
        cursor: pointer;
    }
    g.key > circle { 
        fill: #A0A0A060;
    }
    g.key:hover > circle { 
        fill: var(--primback); 
        stroke: gray; 
        stroke-width: .2;
    }
  
    g.key > text.major { font-size: .5em; font-weight: 500;  }
    g.key > text.minor { font-size: .4em; }

    g.selectedKey > circle, 
    g.selectedKey:hover > circle { 
        fill: var(--primary); 
    }
    g.selectedKey > text, 
    g.selectedKey:hover > text { 
        fill: var(--primback); 
    }
  </style>
  
  <svg viewBox="0 0 {size} {size}">
    <circle r={lgCircleRadius} cx={center} cy={center} fill="Gainsboro" stroke="Silver" stroke-width=".4" />
    <circle r={mdCircleRadius} cx={center} cy={center} fill="WhiteSmoke" />
    <circle r={smCircleRadius} cx={center} cy={center} fill="white" stroke="Gainsboro" stroke-width=".4" />
    {#each majorKeys as _, idx (idx)}  
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <g class="key" role="button" tabindex="0" class:selectedKey={minorKeys[idx].includes(selectedKey)} 
        onclick={() => changeKey(minorKeys[idx][0])}>
        <circle class="minor"
            cx={calcX(idx, innerRadius)}
            cy={calcY(idx, innerRadius)}
            r={innerItemRadius} 
          />
        <text class="minor"
          x={calcX(idx, innerRadius)}
          y={calcY(idx, innerRadius)}
          text-anchor="middle"
          dominant-baseline="middle"
        >
          {minorKeys[idx][0]}
        </text>
      </g>
  
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <g class="key" role="button" tabindex="0" class:selectedKey={majorKeys[idx].includes(selectedKey)} 
        onclick={() => changeKey(majorKeys[idx][0])}>
        <circle class="major"
          cx={calcX(idx, outerRadius)}
          cy={calcY(idx, outerRadius)}
          r={outerItemRadius}
        />
        <text class="major"
          x={calcX(idx, outerRadius)}
          y={calcY(idx, outerRadius)}
          text-anchor="middle"
          dominant-baseline="middle"
        >
          {majorKeys[idx][0]}
        </text>
      </g>
    {/each}
  </svg>