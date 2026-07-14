import type { Action } from 'svelte/action';
import type { IOSMDOptions, OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

export type ScoreViewState = 'idle' | 'loading' | 'ready' | 'error';

export interface ScoreViewOptions {
    url: string | undefined;
    drawCredits?: boolean;
    drawTitle?: boolean;
    drawPartNames?: boolean;
    firstInstrumentOnly?: boolean;
    measureCount?: number;
    zoom?: number;
    onStateChange?: (state: ScoreViewState) => void;
}

const FIRST_MEASURE_NUMBER = 1;
const FIRST_SYSTEM_NUMBER = 1;
const FIRST_INSTRUMENT_INDEX = 0;
const DEFAULT_ZOOM = 1;
const RESIZE_DEBOUNCE_MS = 100;

function buildRangeOptions(measureCount: number | undefined): Partial<IOSMDOptions> {
    if (measureCount) {
        return {
            drawFromMeasureNumber: FIRST_MEASURE_NUMBER,
            drawUpToMeasureNumber: FIRST_MEASURE_NUMBER + measureCount - 1,
            drawUpToSystemNumber: FIRST_SYSTEM_NUMBER,
        };
    }
}

function keepOnlyFirstInstrument(viewer: OpenSheetMusicDisplay): void {
    viewer.Sheet.Instruments.forEach((instrument, index) => {
        instrument.Visible = index === FIRST_INSTRUMENT_INDEX;
    });
}

/**
 * Mounts an OpenSheetMusicDisplay instance on the element it is attached to,
 * and re-renders whenever the url or measureCount changes, or the parent
 * element's size changes (OSMD's built-in autoResize only reacts to
 * window.onresize, not to container/parent size changes).
 * Cleans up on destroy.
 * @param node 
 * @param initialOptions 
 * @returns 
 */
export const scoreView: Action<HTMLElement, ScoreViewOptions> = (node, initialOptions) => {
    let options = initialOptions;
    let loadedUrl: string | undefined;
    let currentViewer: OpenSheetMusicDisplay | undefined;
    let resizeTimeoutId: ReturnType<typeof setTimeout> | undefined;

    function rerenderOnParentResize(): void {
        if (resizeTimeoutId) {
            clearTimeout(resizeTimeoutId);
        }
        resizeTimeoutId = setTimeout(() => {
            resizeTimeoutId = undefined;
            if (currentViewer) {
                currentViewer.render();
            }
        }, RESIZE_DEBOUNCE_MS);
    }

    const resizeObserver = new ResizeObserver(rerenderOnParentResize);

    async function render(url: string): Promise<void> {
        options.onStateChange?.('loading');
        try {
            const { OpenSheetMusicDisplay } = await import('opensheetmusicdisplay');
            const viewer = new OpenSheetMusicDisplay(node, {
                autoResize: true,
                defaultColorMusic: 'var(--text)',
                drawCredits: options.drawCredits ?? false,
                drawTitle: options.drawCredits ?? false,
                drawPartNames: options.drawPartNames ?? false,
                ...buildRangeOptions(options.measureCount),
            });
            await viewer.load(url);
            if (options.firstInstrumentOnly) {
                keepOnlyFirstInstrument(viewer);
            }
            viewer.zoom = options.zoom ?? DEFAULT_ZOOM;
            viewer.render();
            currentViewer = viewer;
            options.onStateChange?.('ready');
        } catch (error) {
            console.error('Failed to render the music score', error);
            options.onStateChange?.('error');
        }
    }

    if (node.parentElement) {
        resizeObserver.observe(node.parentElement);
    }

    if (options.url) {
        loadedUrl = options.url;
        render(options.url);
    }

    return {
        update(newOptions: ScoreViewOptions) {
            const hasRangeChanged = newOptions.measureCount !== options.measureCount;
            const hasZoomChanged = newOptions.zoom !== options.zoom;
            const hasInstrumentFilterChanged = newOptions.firstInstrumentOnly !== options.firstInstrumentOnly;
            options = newOptions;
            if (
                newOptions.url &&
                (newOptions.url !== loadedUrl || hasRangeChanged || hasZoomChanged || hasInstrumentFilterChanged)
            ) {
                loadedUrl = newOptions.url;
                node.innerHTML = '';
                currentViewer = undefined;
                render(newOptions.url);
            }
        },
        destroy() {
            resizeObserver.disconnect();
            if (resizeTimeoutId) {
                clearTimeout(resizeTimeoutId);
            }
            node.innerHTML = '';
        },
    };
};