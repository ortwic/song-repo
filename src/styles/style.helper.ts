import Color from 'color';

const root = document.querySelector(':root');

export function getCssVariable(name: string): string {
    return getComputedStyle(root).getPropertyValue(name);
}

export const redToGreenRange = (value: number, maxLight = 50, minLight = 36, margin = 25) => {
    const greenMax = 1.2;
    let outer = 0;
    if (value <= margin) {
        outer = margin - value;
    }
    if (value >= 100 - margin) {
        outer = margin - (100 - value);
    }
    const percent = Math.pow(outer * (1 / margin), 2);
    const lightness = maxLight - percent * (maxLight - minLight);
    return Color.hsl(value * greenMax, 100, lightness);
};

export const redToGreenGradient = (value: number, dir = 'to right', offset = 0.3, maxLight = 50, minLight = 36, margin = 25) => {
    const s = redToGreenRange(value - value * offset, maxLight, minLight, margin);
    const m = redToGreenRange(value, maxLight, minLight, margin);
    const e = redToGreenRange(value + (100 - value) * offset, maxLight, minLight, margin);
    return [ `linear-gradient(${dir}, ${s.hex()}, ${m.hex()} ${value}%, ${e.hex()})`, m.hex() ];
};