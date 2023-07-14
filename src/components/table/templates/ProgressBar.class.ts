import { redToGreenGradient } from "../../../styles/style.helper";

export default class ProgressBar {
    private isMouseDown = false;
    private oldValue = 0;
    public value = 0;
    public readonly element = document.createElement('div');
    private progressBar = document.createElement('div');
    private percentValue = document.createElement('div');

    constructor() {
        this.element.classList.add('progress-bar-container');
        this.progressBar.classList.add('progress-bar');
        this.percentValue.classList.add('percent-value');

        this.element.appendChild(this.progressBar);
        this.element.appendChild(this.percentValue);
    }

    public setProgress(value: number): void {
        this.value = value;
        this.progressBar.style.width = 100 - value + '%';
        this.progressBar.style.marginLeft = value + '%';
        this.percentValue.textContent = value + '%';

        this.setColorGradient(value, .3);
    }

    private setColorGradient(value: number, offset: number):void  {        
        const s = redToGreenGradient(value - value * offset);
        const m = redToGreenGradient(value);
        const e = redToGreenGradient(value + (100 - value) * offset);
        this.element.style.background = `linear-gradient(to right, ${s.hex()}, ${m.hex()}, ${e.hex()})`;
        this.element.style.boxShadow = `0 0 12px ${m.hex()}80`;
    }

    updateProgress(event: MouseEvent): void {
        const rect = this.element.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const percentage = Math.round((clickX / rect.width) * 100);
        this.setProgress(percentage);
    }

    public static create(value = 0): ProgressBar {
        const bar = new ProgressBar();
        bar.setProgress(+value);

        bar.element.addEventListener('mousedown', (event) => {
            bar.isMouseDown = true;
            bar.oldValue = bar.value;
            bar.updateProgress(event);
        });

        bar.element.addEventListener('mousemove', (event) => {
            if (bar.isMouseDown) {
                bar.updateProgress(event);
            }
        });

        document.addEventListener('mouseup', () => {
            // check to ensure to fire event for own instance only
            if (bar.isMouseDown) {
                bar.element.dispatchEvent(
                    new CustomEvent<number[]>('change', {
                        detail: [bar.value, bar.oldValue],
                    })
                );
            }
            bar.isMouseDown = false;
        });
        return bar;
    }
}
