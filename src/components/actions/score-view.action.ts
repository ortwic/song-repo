import type { Action } from 'svelte/action';

export type ScoreViewState = 'idle' | 'loading' | 'ready' | 'error';

export interface ScoreViewOptions {
    url: string | undefined;
    onStateChange?: (state: ScoreViewState) => void;
}

// Mounts an OpenSheetMusicDisplay instance on the element it is attached to,
// and re-renders whenever the url changes. Cleans up on destroy.
export const scoreView: Action<HTMLElement, ScoreViewOptions> = (node, initialOptions) => {
    let options = initialOptions;
    let loadedUrl: string | undefined;

    async function render(url: string): Promise<void> {
        options.onStateChange?.('loading');
        try {
            const { OpenSheetMusicDisplay } = await import('opensheetmusicdisplay');
            const viewer = new OpenSheetMusicDisplay(node, {
                autoResize: true,
                drawTitle: false,
                defaultColorMusic: "var(--text)",
            });
            await viewer.load(url);
            viewer.render();
            options.onStateChange?.('ready');
        } catch (error) {
            console.error('Failed to render the music score', error);
            options.onStateChange?.('error');
        }
    }

    if (options.url) {
        loadedUrl = options.url;
        render(options.url);
    }

    return {
        update(newOptions: ScoreViewOptions) {
            options = newOptions;
            if (newOptions.url && newOptions.url !== loadedUrl) {
                loadedUrl = newOptions.url;
                node.innerHTML = '';
                render(newOptions.url);
            }
        },
        destroy() {
            node.innerHTML = '';
        },
    };
};