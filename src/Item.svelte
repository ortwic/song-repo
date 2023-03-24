<script>

    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();
    
    function remove() {
		dispatch('remove', { uid });
	}

	function toggleStatus() {
        let newStatus = !complete;
		dispatch('toggle', {
            uid,
            newStatus
        });
    }    

    export let uid; // document ID
    export let title;
    export let progress;
</script>

<style>
    .is-complete {
        color: green;
    }
</style>


<li>
    <input type="checkbox" value={ progress > 99 } on:click={toggleStatus}/>
    <span class={ progress > 99 ? 'is-complete' : '' }>{ title }</span>
    <button on:click={remove}> ❌ </button>
</li>
