<script lang="ts">
    import { t } from "svelte-i18n";

    interface Props {
        children?: import('svelte').Snippet;
        controls?: import('svelte').Snippet;
        onClose?: () => void;
    }

    let { children, controls, onClose }: Props = $props();
</script>

<div class="titlebar">
    <span class="text">
        {@render children?.()}
    </span>
    {@render controls?.()}
    <button title="{ $t('menu.close') }" class="titlebar-button" onclick={onClose}>
        <i class="bx bx-x larger"></i>
    </button>
</div>