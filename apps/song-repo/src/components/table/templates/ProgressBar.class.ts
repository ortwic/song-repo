import { redToGreenGradient } from '../../../styles/style.helper';
import style from './ProgressBar.css?inline';

class ProgressBar extends HTMLElement {
    isMouseDown = false;
    oldValue = 0;
    value = 0;
    min = 0;
    max = 100;
    readonly progressBar = document.createElement('div');
    readonly percentValue = document.createElement('span');

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        const styleElement = document.createElement('style');
        styleElement.innerHTML = style;

        shadow.appendChild(styleElement);
        shadow.appendChild(this.progressBar);
        shadow.appendChild(this.percentValue);
        
        this.addEventListener('mousedown', this.start);
        this.addEventListener('touchstart', this.start);
        this.addEventListener('mousemove', this.move);
        this.addEventListener('touchmove', this.move);
        this.addEventListener('mouseup', this.end);
        this.addEventListener('touchend', this.end);
    }

    static get observedAttributes() {
        return ['value', 'min', 'max'];
    }

    private start(event: MouseEvent | TouchEvent) {
        this.isMouseDown = true;
        this.oldValue = this.value;
        this.updateProgress(this.clientX(event));
    }

    private move(event: MouseEvent | TouchEvent) {
        if (this.isMouseDown) {
            this.updateProgress(this.clientX(event));
        }
    }

    private clientX(event: MouseEvent | TouchEvent): number {        
        if (event instanceof MouseEvent) {
            return event.clientX;
        } 

        if (event instanceof TouchEvent && event.touches.length > 0) {
            return event.touches[0].clientX;
        } 
    }

    private end() {
        // check to ensure to fire event for own instance only
        if (this.isMouseDown) {
            this.dispatchEvent(
                new CustomEvent<number[]>('change', {
                    detail: [this.value, this.oldValue],
                })
            );
        }
        this.isMouseDown = false;
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        switch (name) {
        case 'min':
            this.min = +newValue;
            break;
        case 'max':
            this.max = +newValue;
            break;
        case 'value':
            this.setProgress(+newValue);
            break;
        }
    }

    setProgress(value: number) {
        this.value = value < this.min ? this.min : value > this.max ? this.max : value;
        this.progressBar.style.width = this.max - this.value + '%';
        this.progressBar.style.marginLeft = this.value + '%';
        this.percentValue.textContent = this.value + '%';

        const [ gradient, color ] = redToGreenGradient(this.value);
        this.style.background = gradient;
        this.style.boxShadow = `0 0 12px ${color}80`;
    }

    updateProgress(clientX: number): void {
        const rect = this.getBoundingClientRect();
        const clickX = clientX - rect.left;
        const percentage = Math.round((clickX / rect.width) * this.max);
        this.setProgress(percentage);
    }
}

if(!window.customElements.get('progress-bar')) {
    window.customElements.define('progress-bar', ProgressBar);
}
