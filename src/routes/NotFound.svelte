<script lang="ts">
    import { t } from 'svelte-i18n';
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();

    const no = Math.floor(Math.random() * $t('notfound.messages').length );
</script>

<div>
    <h2>{ $t('notfound.title') }</h2>
    <p>
        { $t(`notfound.messages.${no}`) }
    </p>
    <p style="color: red">
        {@render children?.()}
    </p>
</div>

<style>
    h2 {
        color: var(--primary);
    }

    div {
        margin: 1em;
    }
</style>