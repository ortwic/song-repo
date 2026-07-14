import { getCssVariable } from '../../styles/style.helper';

interface QRCodeParams {
    text: string;
    onCreated?: (dataUrl: string) => void;
}

export function generateQRCode(element: HTMLCanvasElement, { text, onCreated }: QRCodeParams): void {
    async function createQRCode(text: string) {
        function drawWhiteCircle(center: number, size: number): void {
            ctx.beginPath();
            ctx.arc(center, center, size, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        }

        async function drawLogo(center: number, size: number): Promise<void> {
            const logo = new Image();
            logo.src = '/logo.svg';
            await new Promise(resolve => logo.onload = resolve);

            const pos = center - size / 2.15;
            ctx.drawImage(logo, pos, pos, size, size);
        }
        
        const { default: QRCode } = await import('qrcode');
        await QRCode.toCanvas(element, text, {
            errorCorrectionLevel: 'H',
            width: 128,
            margin: 0,
            color: {
                dark: `${getCssVariable('--text')}`,
                light: '#ffffff00'
            }
        });

        const ctx = element.getContext('2d');
        const center = element.width / 2;
        const size = element.width * 0.18;

        drawWhiteCircle(center, size * 0.66);
        await drawLogo(center, size);

        return element.toDataURL('image/png');
    }

    createQRCode(text)
        .then(dataUrl => onCreated?.(dataUrl));
}