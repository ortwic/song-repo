<script lang="ts">
    import { onMount } from "svelte";
    import { t } from "svelte-i18n";
    import { setSessionError } from "../../../domain/error-handler";

    const SESSION_CONSENT_KEY = 'song-repo_iframe-consent';

    interface Props {
        src: string;
        title: string;
        allow?: string;
        referrerpolicy?: ReferrerPolicy;
        sandbox?: string;
        consent?: boolean;
        width?: number | string;
        height?: number | string;
        loading?: 'lazy' | 'eager';
        onLoad?: () => void;
        onError?: (err: unknown) => void;
    }

    let {
        src,
        title,
        allow,
        referrerpolicy,
        sandbox,
        consent,
        width,
        height,
        loading = 'lazy',
        onLoad,
        onError
    }: Props = $props();

    let isLoading = $state(false);
    let hasFixedSize = $derived(width !== undefined || height !== undefined);
    let sizeStyle = $derived(
        hasFixedSize
            ? `--iframe-width:${toCssSize(width)};--iframe-height:${toCssSize(height)}`
            : undefined
    );
    const approved = $state(sessionStorage.getItem(SESSION_CONSENT_KEY));

    $effect(() => {
        // Track src so the spinner re-appears each time the loaded resource changes.
        src;
        isLoading = true;
    });

    onMount(() => {
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        }
    });

    function toCssSize(value: number | string | undefined): string {
        if (value === undefined) {
            return 'auto';
        }
        return typeof value === 'number' ? `${value}px` : value;
    }

    function handleBeforeUnload(): void {
        if (consent) {
            // Reload could be triggered intentionally or unexpectedly by some extension like ublock origin
            const title = $t('warnings.extension-interrupt.title');
            const message = '<i class="bx bx-extension"></i> ' + $t('warnings.extension-interrupt.body');
            setSessionError({
                title,
                body: message,
                error: new Error(message, { cause: src })
            });
        }
    }

    function provider() {
        try {
            return new URL(src).hostname;
        } catch (err) {
            return src.replace(/^https?:\/\//, '').split('/').at(0);
        }
    }

    function approve() {
        consent = true;
        sessionStorage.setItem(SESSION_CONSENT_KEY, provider());
    }

    function handleLoad(): void {
        isLoading = false;
        onLoad?.();
    }

    function handleError(err: unknown): void {
        isLoading = false;
        onError?.(err);
    }
</script>

<div class="iframe-container" class:fixed-size={hasFixedSize} style={sizeStyle}>
    {#if consent || approved}
        {#if isLoading}
            <div class="iframe-loading-overlay">
                <span class="spinner"></span>
            </div>
        {/if}
        {#key src}
            <iframe
                {src}
                {title}
                {allow}
                {referrerpolicy}
                {sandbox}
                {loading}
                onload={handleLoad}
                onerror={handleError}
                allowfullscreen
            ></iframe>
        {/key}
    {:else}
        <div class="iframe-consent">
            <h2>
                <i class="bx bx-shield-quarter"></i>
                {$t('iframe.consent.title')}
            </h2>
            <p>
                {@html $t('iframe.consent.description', {
                    values: {
                        provider: provider()
                    }
                })}
            </p>
            <button
                type="button"
                class="consent-button"
                onclick={approve}
            >
                {$t('iframe.consent.accept')}
            </button>
        </div>
    {/if}
</div>

<style lang="scss">
    .iframe-container {
        position: relative;
        width: 100%;
        flex: 1;
        display: flex;

        &.fixed-size {
            width: var(--iframe-width, auto);
            flex: none;

            iframe {
                width: var(--iframe-width, 100%);
                height: var(--iframe-height, auto);
                flex: none;
            }
        }
    }
    .iframe-loading-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid var(--border);
        z-index: 1;
    }
    iframe {
        width: 100%;
        flex: 1;
        border: none;
    }

    .iframe-consent {
        flex: 1;
        min-height: 260px;
        padding: 2rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        border: 1px solid var(--border);
    }

    .consent-button {
        cursor: pointer;
    }
</style>