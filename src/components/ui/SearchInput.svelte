<script lang="ts">
    import { onMount, createEventDispatcher } from "svelte";
    import LoadingBar from "./elements/LoadingBar.svelte";

    type T = $$Generic;
    export let id: string;
    export let placeholder = '';
    export let required = false;
    export let value = '';
    export let debounceMs = 0;
    export let minChars = 1;
    export let request: (value: string) => Promise<T[]> = () => (undefined);
    let inputElement: HTMLInputElement;
    let listElement: HTMLElement;
    let results: T[];
    let isLoading = false;

    const dispatch = createEventDispatcher();
	let timer: NodeJS.Timeout;
    let listPos = { top: '0', left: '0', width: 'auto' };

    onMount(() => updateListPosition());

	function input(ev: Event) {
        const target = ev.target as HTMLInputElement;
        if (target.value.length > minChars) {
            clearTimeout(timer);
            timer = setTimeout(async () => {
                isLoading = true;
                dispatch('input', target.value);
                try {
                    results = await request(target.value);
                    return;
                } catch (error) {
                    dispatch('error', target.value);
                } finally {                
                    isLoading = false;
                }
            }, debounceMs);
        } else if (!target.value) {
            dispatch('clear');
        }
	}
 
    function clickOutside({ target }) {
        if (!listElement.contains(target)) {
            reset();
        }
    }

    function reset(): void {
        results = undefined;
    }

    function updateListPosition() {
        // TODO onreize not working
        if (inputElement) {
            const rect = inputElement.getBoundingClientRect();
            listPos = {
                top: `${rect.bottom}px`,
                left: `${rect.left}px`,
                width: `${rect.width}px`,
            };
        }
    }
</script>

<svelte:body on:resize={updateListPosition} on:click={clickOutside}/>

<!-- TODO can this converted to a HTMLElement so it can be used as template in Tabulator? -->
<input class="lg" type="text" bind:this={inputElement} {id} {placeholder} {required} {value} 
    on:input={input} on:focus={input}/>
<div class="list" 
    bind:this={listElement} 
    style:top={listPos.top} 
    style:left={listPos.left} 
    style:min-width={listPos.width}>
    <LoadingBar {isLoading}>searching...</LoadingBar>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class:results={results} on:click={reset}>
        <slot {results}></slot>
    </div>
</div>

<style lang="scss">
input {
    border: 0;
}

div.list {
    position: fixed;
    top: 0;
    left: 0;
    border: 1px solid gray;
    translate: unset;

    div.results {
        max-width: 50vw;
        max-height: 50vh;
        overflow: auto;
        background-color: var(--primback);
    }
}
</style>