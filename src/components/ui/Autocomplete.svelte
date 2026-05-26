<script lang="ts" generics="T extends object | string">
    import { tick } from 'svelte';

    interface ItemSnippetArg {
        item: T;
        index: number;
    }

    interface Props {
        searchFunction: (query: string) => Promise<T[]> | T[];
        labelField?: keyof T;
        delay?: number;
        minChars?: number;
        placeholder?: string;
        value?: string | undefined;
        showClear?: boolean;
        onSelect?: (item: T | null) => void;
        class?: string;
        item?: import('svelte').Snippet<[ItemSnippetArg]>;
        header?: import('svelte').Snippet;
        footer?: import('svelte').Snippet;
        loading?: import('svelte').Snippet;
    }

    let {
        searchFunction,
        labelField,
        delay = 400,
        minChars = 2,
        placeholder = '',
        value = $bindable<string | undefined>(undefined),
        showClear = false,
        onSelect,
        class: className = '',
        item: itemSnippet,
        header: headerSnippet,
        footer: footerSnippet,
        loading: loadingSnippet,
    }: Props = $props();

    export function close() {
        isOpen = false;
        activeIndex = -1;
    }

    let results: T[] = $state([]);
    let isOpen = $state(false);
    let isLoading = $state(false);
    let activeIndex = $state(-1);
    let inputEl: HTMLInputElement;
    let listEl: HTMLUListElement;
    let debounceTimer: ReturnType<typeof setTimeout>;
    let searchId = 0;

    function onInput() {
        clearTimeout(debounceTimer);
        activeIndex = -1;

        if ((value ?? '').length < minChars) {
            results = [];
            isOpen = false;
            isLoading = false;
            return;
        }

        isLoading = true;
        isOpen = true;

        const id = ++searchId;
        debounceTimer = setTimeout(async () => {
            try {
                const data = await searchFunction(value ?? '');
                if (id !== searchId) return; // stale
                results = data ?? [];
            } catch {
                if (id !== searchId) return;
                results = [];
            } finally {
                if (id === searchId) isLoading = false;
            }
        }, delay);
    }

    function select(item: T) {
        value = String(item[labelField] ?? '');
        results = [];
        isOpen = false;
        activeIndex = -1;
        onSelect?.(item);
    }

    function clear() {
        value = '';
        results = [];
        isOpen = false;
        isLoading = false;
        activeIndex = -1;
        searchId++;
        clearTimeout(debounceTimer);
        onSelect?.(null);
        inputEl?.focus();
    }

    function onKeydown(e: KeyboardEvent) {
        if (!isOpen) return;

        const itemCount = results.length; // footer always rendered separately
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIndex = Math.min(activeIndex + 1, itemCount - 1);
            scrollActive();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIndex = Math.max(activeIndex - 1, -1);
            scrollActive();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && activeIndex < results.length) {
                select(results[activeIndex]);
            }
        } else if (e.key === 'Escape') {
            isOpen = false;
            activeIndex = -1;
        }
    }

    async function scrollActive() {
        await tick();
        const el = listEl?.querySelector<HTMLElement>(`[data-idx="${activeIndex}"]`);
        el?.scrollIntoView({ block: 'nearest' });
    }

    function onBlur(e: FocusEvent) {
        // Delay so click on list item fires first
        setTimeout(() => {
            if (!listEl?.contains(document.activeElement)) {
                isOpen = false;
                activeIndex = -1;
            }
        }, 150);
    }

    function onFocus() {
        if (results.length > 0) isOpen = true;
    }
</script>

<div class="wrapper {className}" role="combobox" aria-haspopup="listbox" aria-expanded={isOpen}>
    <div class="input-row">
        <span class="icon-search" aria-hidden="true">
            {#if isLoading}
            <span class="spinner"></span>
            {:else}
            <i class="bx bx-search"></i>
            {/if}
        </span>

        <input
            bind:this={inputEl}
            value={value ?? ''}
            oninput={(e) => { value = (e.currentTarget as HTMLInputElement).value; onInput(); }}
            type="text"
            {placeholder}
            autocomplete="off"
            autocorrect="off"
            spellcheck="false"
            class="input"
            aria-autocomplete="list"
            aria-controls="list"
            aria-activedescendant={activeIndex >= 0 ? `item-${activeIndex}` : undefined}
            onkeydown={onKeydown}
            onblur={onBlur}
            onfocus={onFocus}
        />

        {#if value && showClear}
        <button class="clear clear" onclick={clear} aria-label="Clear" tabindex="-1" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
        </button>
        {/if}
    </div>

    {#if isOpen}
    <ul
        bind:this={listEl}
        id="list"
        class="list"
        role="listbox"
    >
        {#if headerSnippet}
        <li class="header" role="presentation">
            {@render headerSnippet()}
        </li>
        {/if}

        {#if isLoading && loadingSnippet}
        <li class="loading" role="presentation">
            {@render loadingSnippet()}
        </li>
        {/if}

        {#each results as result, i}
        <li
            id="item-{i}"
            data-idx={i}
            class="item"
            class:item--active={activeIndex === i}
            role="option"
            aria-selected={activeIndex === i}
            onmousedown={() => select(result)}
            onmousemove={() => activeIndex = i}
        >
            {#if itemSnippet}
                {@render itemSnippet({ item: result, index: i })}
            {:else}
                {String(result[labelField] ?? '')}
            {/if}
        </li>
        {/each}

        {#if footerSnippet}
        <li class="footer" role="presentation">
            {@render footerSnippet()}
        </li>
        {/if}
    </ul>
    {/if}
</div>

<style>
    .wrapper {
        position: relative;
        width: 100%;
    }

    .input-row {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
    }

    .icon-search {
        position: absolute;
        left: 0.6em;
        display: flex;
        align-items: center;
        color: var(--surface-mid);
        pointer-events: none;
        z-index: 1;
    }

    .input {
        width: 100%;
        font-size: 1em;
        font-family: inherit;
        box-sizing: border-box;
        outline: none;
        padding-left: 2.2rem;
        transition: box-shadow 0.15s;
        /* mobile: prevent iOS zoom on focus */
        font-size: max(1em, 16px);
        border-radius: .6rem;
    }

    .input:focus {
        box-shadow: 0 0 0 2px var(--surface);
        border-color: var(--surface);
    }

    .clear {
        position: absolute;
        right: 0.4em;
        display: flex;
        align-items: center;
        color: var(--text-muted);
        touch-action: manipulation;
    }

    .clear:hover {
        color: var(--text);
    }

    /* ── Dropdown ── */
    .list {
        position: absolute;
        top: calc(100% + 2px);
        left: 0;
        right: 0;
        margin: 0;
        padding: 0;
        list-style: none;
        /* Farben aus globalen Vars statt hardcoded */
        color: var(--text);
        background-color: var(--surface);
        border: 1px solid var(--surface-mid);
        border-radius: 4px;
        box-shadow: 0.1em 0.1em 0.4em #00000080; /* wie PopupMenu */
        max-height: min(360px, 60svh);
        overflow-y: auto;
        overscroll-behavior: contain;
        z-index: 9999;
        -webkit-overflow-scrolling: touch;
    }

    .item {
        padding: 0;
        cursor: pointer;
    }

    .item--active,
    .item:hover {
        color: black;
        background-color: var(--surface-mid);
        transition: all 0.2s ease-in-out;
    }

    .header {
        border-bottom: 1px solid var(--surface-mid);
    }

    .footer {
        border-top: 1px solid var(--surface-mid);
    }

    .loading {
        padding: 0.5em 1em;
    }
</style>