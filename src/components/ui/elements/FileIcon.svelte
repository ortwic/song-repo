<script lang="ts">
    export let width = '28px';
    export let height = '28px';
    export let type = 'FILE';
    export let fill = 'gray';
    export let fontStretch = 'normal';
    export let letterSpacing = 'unset';
    export let style: 'normal' | 'condensed' = 'normal';
</script>

<svg {fill} {width} {height} viewBox="0 0 24 24" version="1.1" id="svg10" xmlns="http://www.w3.org/2000/svg">
  <defs id="defs14">
    <rect x="-857.58716" y="-417.38592" width="174.47" height="245.60008" id="rect1085" />
    <rect x="854.903" y="284.52031" width="519.38378" height="318.07223" id="rect1064" />
    <rect x="861.68446" y="368.20878" width="525.7414" height="246.73784" id="rect351" />
  </defs>
  <path d="M19.2,6.67,12.34,0H2.74A2.77,2.77,0,0,0,.81.78,2.62,2.62,0,0,0,0,2.67V21.33a2.62,2.62,0,0,0,.81,1.89A2.77,2.77,0,0,0,2.74,24H16.46a2.77,2.77,0,0,0,1.93-.78,2.62,2.62,0,0,0,.81-1.89V20H24V9.33H19.2ZM11.66,2.16,17,7.33H11.66Zm11,8.51v8H6.17v-8Z" id="path2" />
  <text transform="matrix(0.03,0,0,0.03,-18.721974,2.0533777)" id="text1062" 
    style="font-style:normal;font-variant:normal;font-weight:bold;font-stretch:{fontStretch};font-size:242.667px;font-family:Tahoma;-inkscape-font-specification:'Tahoma Bold';letter-spacing:-8px;white-space:pre;shape-inside:url(#rect1064);display:inline;fill:#000000;stroke:none;stroke-width:10">
    <tspan x="854.90234" y="505.912" id="tspan1147">
        <tspan class={style} style="letter-spacing:{letterSpacing}" id="tspan1145">
            {type}
        </tspan>
    </tspan>
  </text>
</svg>

<style>
    tspan.normal {
        font-family:Arial;
    }

    tspan.condensed {
        font-family:Arial;
        font-stretch:condensed;
    }
</style>
