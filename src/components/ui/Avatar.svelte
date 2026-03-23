<script>
    import { getCssVariable } from '../../styles/style.helper';

    export let photoURL = '';
    export let title = '';
    export let size = '50px';
	export let color = getCssVariable('--primary');
</script>

{#if photoURL}
<img src={photoURL} style:width={size} alt={title} {title}>	
{:else}
<span class="avatar" style:width={size} style:height={size}>
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
        <g id="SVGRepo_iconCarrier"> 
            <circle cx="12" cy="12" r="10" stroke={color} fill="white" stroke-width="1.5"></circle> 
            <circle opacity="0.5" cx="12" cy="9" r="3" stroke={color} stroke-width="1.5"></circle> 
            <path opacity="0.5" d="M17.9691 20C17.81 17.1085 16.9247 15 11.9999 15C7.07521 15 6.18991 17.1085 6.03076 20" stroke={color} stroke-width="1.5" stroke-linecap="round"></path> 
        </g>
    </svg>
</span>
{/if}
