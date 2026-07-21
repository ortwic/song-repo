import type { Component } from 'svelte';
import { routeContext } from '@keenmate/svelte-spa-router/helpers/route-metadata';

function createMenuContext() {
    let visible = $state(false);
    let submenus = $state<Component[]>(undefined);
    let offsetWidth = $state(0);

    function computeMenuOffset(node: HTMLElement) {
        const updateOffset = (): void => {
            offsetWidth = window.innerWidth - node.clientWidth;
        };

        updateOffset();

        const resizeObserver = new ResizeObserver(() => updateOffset());
        resizeObserver.observe(node);

        window.addEventListener('resize', updateOffset);

        return {
            destroy(): void {
                resizeObserver.disconnect();
                window.removeEventListener('resize', updateOffset);
            },
        };
    }

    return {
        get visible(): boolean {
            return visible;
        },
        get shouldHideLogin(): boolean {
            return routeContext()?.hideLogin ?? false;
        },
        get context(): Component[] {
            return routeContext()?.menus ?? [];
        },
        get userContext(): Component[] {
            return routeContext()?.userMenus ?? [];
        },
        get submenus(): Component[] {
            return submenus;
        },
        get offsetWidth(): number {
            return offsetWidth;
        },
        offset: computeMenuOffset,
        toggle: () => visible = !visible,
        back: () => {
            if (submenus) {
                submenus = undefined;
            } else {
                visible = false;
            }
        },
        show: (target?: Component) => {
            submenus = target ? [target] : undefined;
            visible = true;
        }
    };
}

export const menu = createMenuContext();

