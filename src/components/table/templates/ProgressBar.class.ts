import { redToGreenGradient } from '../../../styles/style.helper';
import style from './ProgressBar.css?inline';

class ProgressBar extends HTMLElement {
    isMouseDown = false;
    oldValue = 0;
    _disabled = false;
    _value = 0;
    _min = 0;
    _max = 100;
    readonly progressBar = document.createElement('div');
    readonly percentValue = document.createElement('span');
    readonly handle = document.createElement('div');
    readonly handleIndicator = document.createElement('div');

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        const styleElement = document.createElement('style');
        styleElement.innerHTML = style;
        
        shadow.appendChild(styleElement);
        shadow.appendChild(this.progressBar);
        shadow.appendChild(this.percentValue);

        this.handleIndicator.classList.add('indicator');
        this.handle.classList.add('handle');
        this.handle.appendChild(this.handleIndicator);
        shadow.appendChild(this.handle);

        this.handle.addEventListener('mousedown', this.start.bind(this));
        this.handle.addEventListener('touchstart', this.start.bind(this), { passive: true });

        document.addEventListener('mousemove', this.move.bind(this));
        document.addEventListener('touchmove', this.move.bind(this), { passive: false });
        document.addEventListener('mouseup', this.end.bind(this));
        document.addEventListener('touchend', this.end.bind(this));
    }

    set value(val: number) {
        this.setProgress(val);
    }

    get value(): number {
        return this._value;
    }

    set min(val: number) {
        this._min = val;
    }

    get min(): number {
        return this._min;
    }

    set max(val: number) {
        this._max = val;
    }

    get max(): number {
        return this._max;
    }

    set disabled(val: boolean) {
        this.handleDisabled(val);
    }

    get disabled(): boolean {
        return this._disabled;
    }

    static get observedAttributes() {
        return ['value', 'min', 'max'];
    }

    private start(event: MouseEvent | TouchEvent) {
        this.isMouseDown = !this._disabled;
        if (this.isMouseDown) {
            this.oldValue = this._value;
            this.updateProgress(this.clientX(event));
        }
    }

    private move(event: MouseEvent | TouchEvent) {
        if (this.isMouseDown) {
            if (event instanceof TouchEvent) {
                // prevent scroll except when handle is active
                event.preventDefault();
            }
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
                    detail: [this._value, this.oldValue],
                })
            );
        }
        this.isMouseDown = false;
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        switch (name) {
            case 'min':
                this._min = +newValue;
                break;
            case 'max':
                this._max = +newValue;
                break;
            case 'value':
                this.setProgress(+newValue);
                break;
            case 'disabled':
                this.handleDisabled(Boolean(newValue));
                break;
        }
    }

    handleDisabled(state: boolean) {
        this._disabled = state;
        if (state) {
            this.handle.classList.remove('handle');
        } else {
            this.handle.classList.add('handle');
        }
    }

    setProgress(value: number) {
        this._value = value < this._min ? this._min : value > this._max ? this._max : value;
        this.progressBar.style.width = this._max - this._value + '%';
        this.progressBar.style.marginLeft = this._value + '%';
        this.percentValue.textContent = this._value + '%';
        this.handle.style.left = this._value + '%';
        
        const [gradient, color] = redToGreenGradient(this._value);
        this.style.background = gradient;
        this.style.boxShadow = `0 0 12px ${color}80`;
    }

    updateProgress(clientX: number): void {
        const rect = this.getBoundingClientRect();
        const clickX = clientX - rect.left;
        const percentage = Math.round((clickX / rect.width) * this._max);
        this.setProgress(percentage);
    }

    disconnectedCallback() {
        document.removeEventListener('mousemove', this.move);
        document.removeEventListener('touchmove', this.move);
        document.removeEventListener('mouseup', this.end);
        document.removeEventListener('touchend', this.end);
    }
}

if(!window.customElements.get('progress-bar')) {
    window.customElements.define('progress-bar', ProgressBar);
}
