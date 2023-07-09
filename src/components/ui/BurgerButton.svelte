<script>
    import { menuOpened } from "../../store/menu.store";
</script>

<button class="icon" class:open on:click={() => menuOpened.set(!$menuOpened)}>
    <svg width=32 height=24>
        <line id="top" x1=0 y1=2 x2=32 y2=2/>
        <line id="middle" x1=0 y1=12 x2=32 y2=12/>
        <line id="bottom" x1=0 y1=22 x2=32 y2=22/>
    </svg>
</button>

<style lang="scss">
svg {
    transform: scale(0.7);
    min-height: 24px;
    transition: transform 0.3s ease-in-out;
}

svg line {
    /* `currentColor` means inherit color from the text color */
    stroke: currentColor;
    stroke-width: 3;
    transition: transform 0.3s ease-in-out;
}

/* adjust the Z-index, so that the icon is on top of the sidebar */
button {
    z-index: 20;
}

// /* rotate the top line */
// .open #top {
//     transform: translate(6px, 0px) rotate(45deg)
// }

// /* hide the middle */
// .open #middle {
//     opacity: 0;
// }

// /* rotate the bottom line */
// .open #bottom {
//     transform: translate(-12px, 9px) rotate(-45deg)
// }

</style>