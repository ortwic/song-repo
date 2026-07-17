<script lang="ts">
    import { StorageService } from "../../../service/base/storage.service";
    import { resizable } from "../../actions/resizable-canvas.action";

    let {
        src,
        title = '',
        size = 50,
        ratio = 1,
    }: {
        src: string;
        title?: string;
        size?: number | string;
        ratio?: number;
    } = $props();

    const width = $derived(typeof size === 'number' ? `${size}px` : size);
    const height = $derived(typeof size === 'number' ? `${size / ratio}px` : 'auto');

    const storageService = new StorageService();
    const resolveImgPath = async (path: string): Promise<string> => 
        path.startsWith('http') ? path : storageService.getFileUrl(path);
        
    async function loadImage(path: string): Promise<HTMLImageElement | null> {
        const img = new Image();
        img.src = await resolveImgPath(path);
        return await new Promise<boolean>((resolve) => {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
        }) ? img : null;
    }
</script>

<div {title} style:width={width} style:height={height}>
    {#await loadImage(src)}
        <span class="spinner"></span>        
    {:then img} 
        {#if img}
            <canvas use:resizable={{ img, ratio }}></canvas>
        {:else}
            <span>n/a</span>
        {/if}
    {/await}
</div>

<style>
    div {
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        border: 1px solid var(--border);
    }
</style>
