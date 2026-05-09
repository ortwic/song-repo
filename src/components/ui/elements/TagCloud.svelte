<script lang="ts">
    let { 
        index, 
        item 
    }: { 
        index: Map<string, { count: number }>, 
        item?: import('svelte').Snippet<[string, number]> 
    } = $props();
</script>

{#each index as [tag, { count }]}
    <div title="n={`${count}`}" style="font-size: {count * 4 + 6}px">
        {#if item}
        {@render item(tag, count)}
        {:else}
        {tag}
        {/if}
    </div>
{/each}