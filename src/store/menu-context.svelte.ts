type MenuTarget = 'hidden' | 'dynamic' | 'signup';

function createMenuContext() {
    let menuState = $state<MenuTarget>('hidden');
    let offsetWidth = $state(0);
    
    const getTarget = () => menuState;
    const setTarget = (target: MenuTarget) => menuState = target;

    function updateOffsetWidth(node: HTMLElement): void {
        offsetWidth = window.innerWidth - node.clientWidth;
    }

    return {
        get offsetWidth(): number {
            return offsetWidth;
        },
        updateOffsetWidth,
        getTarget,
        isVisible: () => getTarget() !== 'hidden',
        toggleMenu: () => getTarget() !== 'hidden' ? setTarget('hidden') : setTarget('dynamic'),
        hideMenu: () => setTarget('hidden'),
        showMenu: () => setTarget('dynamic'),
        showSignup: () => setTarget('signup')
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
