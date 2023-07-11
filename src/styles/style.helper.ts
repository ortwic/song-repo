const root = document.querySelector(':root');

export function getCssVariable(name: string): string {
    return getComputedStyle(root).getPropertyValue(name);
}
