<script lang="ts">
  import { messageStack } from "../../store/notification.store";
  import { slideFade } from './transition.helper';
</script>

<section>  
  {#each $messageStack as item}
  <div class={item.type}
    in:slideFade={{ duration: 200 }} 
    out:slideFade={{ duration: 200 }}>
    {item.message}
    <slot name="message"></slot>
  </div>
  {/each}
</section>

<style lang="scss">
section {
  position: fixed; 
  z-index: 2e3;
  left: 0;
  bottom: 0;
  width: 100%;

  div {
    padding: 16px;
    text-align: center;
    opacity: .8;
    transition: all .2s ease-in-out;
  }

  div:hover {
    opacity: 1;
  }

  .info {
    background-color: var(--primback);
  }

  .warn {
    background-color: var(--secondary);
  }

  .error {
    color: white;
    background-color: firebrick;
  }
}
</style>