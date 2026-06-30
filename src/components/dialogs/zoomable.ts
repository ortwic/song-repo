export interface ZoomState {
    scale: number;
    translateX: number;
    translateY: number;
}

export interface ZoomActionOptions {
    minScale?: number;
    maxScale?: number;
    step?: number;
    onChange?: (state: ZoomState) => void;
}

interface PointerEntry {
    x: number;
    y: number;
}

const DEFAULT_MIN_SCALE = 1;
const DEFAULT_MAX_SCALE = 4;
const DEFAULT_ZOOM_FACTOR = 1.2;

export function zoomable(node: HTMLElement, options: ZoomActionOptions = {}) {
    const minScale = options.minScale ?? DEFAULT_MIN_SCALE;
    const maxScale = options.maxScale ?? DEFAULT_MAX_SCALE;
    const zoomFactor = options.step ?? DEFAULT_ZOOM_FACTOR;
    let onChange = options.onChange;
    const doubleClickSteps = [minScale, minScale * 1.5, 1, maxScale * 0.5, maxScale]
        .filter((v, i, a) => v >= minScale && v <= maxScale && a.indexOf(v) === i)
        .sort((a, b) => a - b);

    let scale = 1;
    let translateX = 0;
    let translateY = 0;

    const activePointers = new Map<number, PointerEntry>();
    let pinchStartDistance = 0;
    let pinchStartScale = minScale;
    let panStart: PointerEntry | null = null;
    let panOrigin: PointerEntry = { x: 0, y: 0 };

    function clampScale(value: number): number {
        return Math.min(maxScale, Math.max(minScale, value));
    }

    function applyTransform(): void {
        node.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        onChange?.({ scale, translateX, translateY });
    }

    function resetIfAtMinScale(): void {
        if (scale <= minScale) {
            scale = minScale;
            translateX = 0;
            translateY = 0;
        }
    }

    function getDistance(a: PointerEntry, b: PointerEntry): number {
        return Math.hypot(a.x - b.x, a.y - b.y);
    }

    function getMidpoint(a: PointerEntry, b: PointerEntry): PointerEntry {
        return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    }

    function handlePointerDown(event: PointerEvent): void {
        node.setPointerCapture(event.pointerId);
        activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

        if (activePointers.size === 2) {
            const [a, b] = [...activePointers.values()];
            pinchStartDistance = getDistance(a, b);
            pinchStartScale = scale;
            panStart = null;
        } else if (activePointers.size === 1 && scale > minScale) {
            panStart = { x: event.clientX, y: event.clientY };
            panOrigin = { x: translateX, y: translateY };
        }
    }

    function handlePointerMove(event: PointerEvent): void {
        if (!activePointers.has(event.pointerId)) {
            return;
        }
        activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

        if (activePointers.size === 2) {
            const [a, b] = [...activePointers.values()];
            const distance = getDistance(a, b);
            if (pinchStartDistance > 0) {
                scale = clampScale(pinchStartScale * (distance / pinchStartDistance));
                applyTransform();
            }
            return;
        }

        if (activePointers.size === 1 && panStart) {
            translateX = panOrigin.x + (event.clientX - panStart.x);
            translateY = panOrigin.y + (event.clientY - panStart.y);
            applyTransform();
        }
    }

    function handlePointerUp(event: PointerEvent): void {
        activePointers.delete(event.pointerId);
        panStart = null;
        if (activePointers.size === 0) {
            resetIfAtMinScale();
            applyTransform();
        }
    }

    function handleWheel(event: WheelEvent): void {
        event.preventDefault();

        const delta = event.deltaY < 0 ? scale * zoomFactor : scale / zoomFactor;
        scale = clampScale(delta);
        resetIfAtMinScale();
        applyTransform();
    }

    function handleDoubleClick(): void {
        const nextScale = doubleClickSteps.find(s => s > scale + 0.001) ?? minScale;
        scale = clampScale(nextScale);
        resetIfAtMinScale();
        applyTransform();
    }

    node.addEventListener('pointerdown', handlePointerDown);
    node.addEventListener('pointermove', handlePointerMove);
    node.addEventListener('pointerup', handlePointerUp);
    node.addEventListener('pointercancel', handlePointerUp);
    node.addEventListener('wheel', handleWheel, { passive: false });
    node.addEventListener('dblclick', handleDoubleClick);

    applyTransform();

    return {
        update(newOptions: ZoomActionOptions = {}) {
            onChange = newOptions.onChange;
        },
        destroy() {
            node.removeEventListener('pointerdown', handlePointerDown);
            node.removeEventListener('pointermove', handlePointerMove);
            node.removeEventListener('pointerup', handlePointerUp);
            node.removeEventListener('pointercancel', handlePointerUp);
            node.removeEventListener('wheel', handleWheel);
            node.removeEventListener('dblclick', handleDoubleClick);
        }
    };
}