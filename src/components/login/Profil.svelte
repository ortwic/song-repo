<script lang='ts'>
    import { getCssVariable } from "../../styles/style.helper";

    export let displayName: string;
    export let photoURL: string;
    export let email: string;
	export let color = getCssVariable('--primary');

    const emailParts = email.split('@');
</script>

<span class="profil">
	{#if photoURL}
    <img src={photoURL} width="50" alt={email} title={email}>	
	{:else}
	<span class="generic">
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
	{#if displayName}
	<span class="name">{displayName}</span>
	{:else}
	<span class="name smaller">{emailParts[0]}<br/>@{emailParts[1]}</span>
	{/if}
</span> 

<style lang="scss">
    span.profil {
        display: flex;
		justify-content: center;
		align-content: center;
		align-items: center;
		padding: .4em 0;

		img {
			vertical-align: middle;
			border-radius: 2em;
		}

		span.generic {
			width: 50px;
			height: 50px;
		}

		span.name {
			padding: 0 .4em;
			max-width: 8em;
			word-wrap: break-word;
			word-break: break-all;
			overflow: hidden;
		}

		.smaller {
			font-size: smaller;
		}
    }
</style>