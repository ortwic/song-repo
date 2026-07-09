<script lang="ts" generics="T">
    import { t } from 'svelte-i18n';
    import type { Snippet } from 'svelte';
    import DialogBase from './DialogBase.svelte';
    import type { DialogAction, DialogSize } from '../dialog-context.svelte';
    import type { MenuTarget } from '../../model/app.types';

    interface Props {
        items: T[];
        currentIndex: number;
        size: DialogSize;
        target?: MenuTarget;
        title?: string;
        visible?: boolean;
        header?: Snippet;
        controls?: Snippet;
        children?: Snippet<[T]>;
        onNavigate?: (item: T, index: number) => void;
        onClose: (result: { action?: DialogAction }) => void;
    }

    let {
        items,
        currentIndex = $bindable(),
        size,
        target,
        title,
        visible,
        header,
        controls,
        children,
        onNavigate,
        onClose
    }: Props = $props();

    const current = $derived(items[currentIndex]);
    const hasPrev = $derived(currentIndex > 0);
    const hasNext = $derived(currentIndex < items.length - 1);

    function prev(): void {
        if (hasPrev) {
            currentIndex--;
            onNavigate?.(current, currentIndex);
        }
    }

    function next(): void {
        if (hasNext) {
            currentIndex++;
            onNavigate?.(current, currentIndex);
        } else {
            onClose({ action: 'confirm' });
        }
    }
</script>

<DialogBase {size} {target} {title} {visible} type="view" {header} {controls} onClose={() => onClose({})}>
    {#snippet footer()}
        <div class="row">
            <button onclick={prev} disabled={!hasPrev}>
                {$t('dialog.prev')}
            </button>
            <button onclick={next}>
                {hasNext ? $t('dialog.next') : $t('dialog.done')}
            </button>
        </div>
    {/snippet}
    {@render children?.(current)}
</DialogBase>