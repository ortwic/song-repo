<script>
    import { t } from '../service/i18n';

    const no = Math.floor(Math.random() * $t('notfound.messages').length );
</script>

<div>
    <h2>{ $t('notfound.title') }</h2>
    <p>
        { $t(`notfound.messages.${no}`) }
    </p>
    <p style="color: red">
        <slot></slot>
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