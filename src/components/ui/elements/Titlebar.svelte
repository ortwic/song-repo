<script lang="ts">
    import { t } from "svelte-i18n";
    import type { MenuTarget } from "../../../model/types";

    interface Props {
        target?: MenuTarget;
        children?: import('svelte').Snippet;
        controls?: import('svelte').Snippet;
        onClose?: () => void;
    }

    let { target = 'hidden', children, controls, onClose }: Props = $props();
</script>

<div class="titlebar">
    <span class="text">
        {@render children?.()}
    </span>
    {@render controls?.()}
    <button title="{ $t('menu.close') }" data-target={target} class="titlebar-button" onclick={onClose}>
        <i class="bx bx-x larger"></i>
    </button>
</div>