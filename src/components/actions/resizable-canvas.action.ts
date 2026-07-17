interface ImageParams {
    img: HTMLImageElement;
    ratio?: number;
}

export function resizable(canvas: HTMLCanvasElement, { img, ratio }: ImageParams): { destroy: () => void } {
    const observer = new ResizeObserver(() => renderCroppedImage(canvas, img));
    observer.observe(canvas.parentElement!);

    function renderCroppedImage(canvas: HTMLCanvasElement, img: HTMLImageElement) {
        if (img) {
            canvas.width = canvas.parentElement!.clientWidth;
            canvas.height = canvas.parentElement!.clientHeight;

            const ctx = canvas.getContext('2d');
            const { sx, sy, sw, sh } = computeCrop(img, ratio);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);   
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

    return { 
        destroy: () => observer.disconnect() 
    };
}