<script>
    import { createEventDispatcher } from "svelte";
    import { getCssVariable } from "../../styles/style.helper";

    export let title = '';
    export let highlight = getCssVariable('--primary');
    export let color = getCssVariable('--primghost');
    const width = '48px';
    const height = '48px';

    const dispatch = createEventDispatcher();
</script>

<button class="clear icon" {title} on:click={() => dispatch('click')}>
    <!-- <i class="bx bx-plus-circle"></i> -->
    <svg {width} {height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill={highlight} d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4z"></path>
        <path fill={color} d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path>
    </svg>
</button>