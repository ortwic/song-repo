<script>
    import { createEventDispatcher } from "svelte";
    
    const dispatch = createEventDispatcher();
</script>

<div>
    <span><slot></slot></span>
    <button class="close" on:click={() => dispatch('close')}>✕</button>
</div>

<style lang="scss">
    div {
        color: whitesmoke;
        background-color: var(--primary);
        white-space: nowrap;
        font-weight: 500;

        span {
            display: inline-block;
            font-style: italic;
            padding: .4em .8em;
        }
    
        button.close {
            float: right;
            color: inherit;
            background-color: transparent;
            box-shadow: unset;
            border: 0;
            outline: 0;
            transition: all .2s ease-in-out;
        }

        button.close:hover {
            background-color: #F0F0F040;
        }
    }
</style>