import { redToGreenGradient } from '../../../styles/style.helper';
import style from './ProgressBar.css?inline';

class ProgressBar extends HTMLElement {
    isMouseDown = false;
    oldValue = 0;
    value = 0;
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
        
        this.addEventListener('mousedown', (event) => {
            this.isMouseDown = true;
            this.oldValue = this.value;
            this.updateProgress(event);
        });

        this.addEventListener('mousemove', (event) => {
            if (this.isMouseDown) {
                this.updateProgress(event);
            }
        });

        document.addEventListener('mouseup', () => {
            // check to ensure to fire event for own instance only
            if (this.isMouseDown) {
                this.dispatchEvent(
                    new CustomEvent<number[]>('change', {
                        detail: [this.value, this.oldValue],
                    })
                );
            }
            this.isMouseDown = false;
        });
    }

    static get observedAttributes() {
        return ['value'];
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === 'value') {
            this.setProgress(+newValue);
        }
    }

    setProgress(value: number) {
        this.value = value;
        this.progressBar.style.width = 100 - value + '%';
        this.progressBar.style.marginLeft = value + '%';
        this.percentValue.textContent = value + '%';

        const [ gradient, color ] = redToGreenGradient(value);
        this.style.background = gradient;
        this.style.boxShadow = `0 0 12px ${color}80`;
    }

    updateProgress(event: MouseEvent): void {
        const rect = this.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const percentage = Math.round((clickX / rect.width) * 100);
        this.setProgress(percentage);
    }
}

if(!window.customElements.get('progress-bar')) {
    window.customElements.define('progress-bar', ProgressBar);
}
