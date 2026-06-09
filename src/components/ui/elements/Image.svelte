<script lang="ts">
    let {
        src,
        size = 50,
        ratio = 1,
    }: {
        src: string;
        size?: number;
        ratio?: number;
    } = $props();

    async function loadImage(src: string): Promise<HTMLImageElement | null> {
        const img = new Image();
        img.src = src;
        return await new Promise<boolean>((resolve) => {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
        }) ? img : null;
    }

    function resizeable(canvas: HTMLCanvasElement, img: HTMLImageElement): { destroy: () => void } {
        const observer = new ResizeObserver(() => renderCroppedImage(canvas, img));
        observer.observe(canvas.parentElement!);
        return { destroy: () => observer.disconnect() };
    }

    function renderCroppedImage(canvas: HTMLCanvasElement, img: HTMLImageElement) {
        if (img) {
            const ctx = canvas.getContext('2d');
            const { sx, sy, sw, sh } = computeCrop(img, ratio);

            ctx.clearRect(0, 0, size, size);
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);   
        }
    }

    function computeCrop(img: HTMLImageElement, ratio: number) {
        const aspectRatio = img.width / img.height;
        if (aspectRatio > ratio) {
            const sw = img.height * ratio;
            const sx = (img.width - sw) / 2;
            return { sx, sy: 0, sw, sh: img.height };
        } else {
            const sh = img.width / ratio;
            const sy = (img.height - sh) / 2;
            return { sx: 0, sy, sw: img.width, sh };
        }
    }
</script>

<div style:width="{size}px" style:height="{size}px">
    {#await loadImage(src)}
        <span class="spinner"></span>        
    {:then img} 
        {#if img}
            <canvas width={size} height={size} use:resizeable={img}></canvas>
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
