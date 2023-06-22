export default class ProgressBar {
    private isMouseDown = false;
    private oldValue = 0;
    public value = 0;
    public readonly element = document.createElement('div');
    private progressBar = document.createElement('div');
    private percentValue = document.createElement('div');

    constructor(parent: HTMLElement) {
        this.element.classList.add('progress-bar-container');
        this.progressBar.classList.add('progress-bar');
        this.percentValue.classList.add('percent-value');

        this.element.appendChild(this.progressBar);
        this.element.appendChild(this.percentValue);
        parent.appendChild(this.element);
    }

    public setProgress(value: number): void {
        this.value = value;
        this.progressBar.style.width = (100 - value) + '%';
        this.progressBar.style.marginLeft = value + '%';
        this.percentValue.textContent = value + '%';
    }

    updateProgress(event: MouseEvent): void {
        const rect = this.element.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const percentage = Math.round((clickX / rect.width) * 100);
        this.setProgress(percentage);
    }
    
    public static create(parent: HTMLElement, value = 0): ProgressBar {
        const bar = new ProgressBar(parent);
        bar.setProgress(value);

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
                bar.element.dispatchEvent(new CustomEvent<number[]>('change', {
                    detail: [bar.value, bar.oldValue]
                }));
            }
            bar.isMouseDown = false;
        });
        return bar;
    }
}