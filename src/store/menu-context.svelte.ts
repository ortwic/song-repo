function createMenuContext() {
    let offsetWidth = $state(0);

    function updateOffsetWidth(node: HTMLElement): void {
        offsetWidth = window.innerWidth - node.clientWidth;
    }

    return {
        get offsetWidth(): number {
            return offsetWidth;
        },
        updateOffsetWidth,
    };
}

export const menuContext = createMenuContext();

type ContentParams = {
    overflow: 'hidden' | 'auto' | 'scroll' | 'visible';
};

export function content(node: HTMLElement, params: ContentParams = { overflow: 'hidden' }) {
    node.style.overflow = params.overflow;
    menuContext.updateOffsetWidth(node);

    const resizeObserver = new ResizeObserver(() => {
        menuContext.updateOffsetWidth(node);
    });
    resizeObserver.observe(node);

    function handleWindowResize(): void {
        menuContext.updateOffsetWidth(node);
    }

    window.addEventListener('resize', handleWindowResize);

    return {
        destroy(): void {
            resizeObserver.disconnect();
            window.removeEventListener('resize', handleWindowResize);
        },
    };
}
