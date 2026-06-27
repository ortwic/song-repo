import { redToGreenGradient } from '../../styles/style.helper';
import style from './ProgressBar.component.css?inline';

export default class ProgressBarElement extends HTMLElement {
    isMouseDown = false;
    oldValue = 0;
    _disabled = false;
    _value = 0;
    _delta = 0;
    _min = 0;
    _max = 100;
    readonly progressBar = document.createElement('div');
    readonly deltaBar = document.createElement('div');
    readonly percentValue = document.createElement('span');
    readonly progressHandle = document.createElement('div');

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        const styleElement = document.createElement('style');
        styleElement.innerHTML = style;
        
        shadow.appendChild(styleElement);
        shadow.appendChild(this.progressBar);
        shadow.appendChild(this.deltaBar);
        shadow.appendChild(this.percentValue);
        shadow.appendChild(this.progressHandle);
        
        this.deltaBar.classList.add('delta');
        this.progressHandle.classList.add('handle');

        this.progressHandle.addEventListener('mousedown', this.start.bind(this));
        this.progressHandle.addEventListener('touchstart', this.start.bind(this), { passive: true });

        document.addEventListener('mousemove', this.move.bind(this));
        document.addEventListener('touchmove', this.move.bind(this), { passive: false });
        document.addEventListener('mouseup', this.end.bind(this));
        document.addEventListener('touchend', this.end.bind(this));
    }

    set value(val: number) {
        this.drawProgress(val);
        this.drawDiff();
    }

    get value(): number {
        return this._value;
    }

    set delta(val: number) {
        this._delta = val;
        this.drawDiff();
    }

    get delta(): number {
        return this._delta;
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
        return ['value', 'delta', 'min', 'max', 'disabled'];
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
                this.drawProgress(+newValue);
                this.drawDiff();
                break;
            case 'delta':
                this._delta = +newValue;
                this.drawDiff();
                break;
            case 'disabled':
                this.handleDisabled(Boolean(newValue));
                break;
        }
    }

    handleDisabled(state: boolean) {
        this._disabled = state;
        if (state) {
            this.progressHandle.classList.remove('handle');
        } else {
            this.progressHandle.classList.add('handle');
        }
    }

    drawProgress(value: number) {
        this._value = value < this._min ? this._min : value > this._max ? this._max : value;
        this.progressBar.style.width = this._max - this._value + '%';
        this.progressBar.style.marginLeft = this._value + '%';
        this.progressHandle.style.left = this._value + '%';
        this.drawLabel();

        const [gradient, color] = redToGreenGradient(this._value);
        this.style.background = gradient;
        this.style.boxShadow = `0 0 12px ${color}80`;
    }

    drawDiff() {
        const rawLeft = this._value + this._delta;
        const clampedLeft = Math.max(0, Math.min(rawLeft, this._max));
        const clampedRight = Math.max(0, Math.min(this._value, this._max));
        const width = clampedRight - clampedLeft;
        this.drawLabel();

        this.deltaBar.style.left = clampedLeft + '%';
        this.deltaBar.style.width = width + '%';
    }

    drawLabel() {
        const label = Math.max(0, this._value + this._delta);
        this.percentValue.textContent = label.toFixed(0) + '%';
        this.title = `Δ ${this._delta} / Σ ${this._value}`;
    }

    updateProgress(clientX: number): void {
        const rect = this.getBoundingClientRect();
        const clickX = clientX - rect.left;
        const percentage = Math.round((clickX / rect.width) * this._max);
        this.drawProgress(percentage);
        this.drawDiff();
    }

    disconnectedCallback() {
        document.removeEventListener('mousemove', this.move);
        document.removeEventListener('touchmove', this.move);
        document.removeEventListener('mouseup', this.end);
        document.removeEventListener('touchend', this.end);
    }
}

if(!window.customElements.get('progress-bar')) {
    window.customElements.define('progress-bar', ProgressBarElement);
}
