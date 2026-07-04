const HEADING_SELECTOR = 'h1, h2, h3, h4, h5, h6';

export function interceptInternalLinks(node: HTMLElement, onNavigate?: (path: string) => void) {
    function handleClick(event: MouseEvent): void {
        const anchor = (event.target as HTMLElement).closest('a');
        const href = anchor?.getAttribute('href');
        if (anchor && href) {
            const isExternal = /^https?:\/\//.test(href) && !href.startsWith(window.location.origin);
            if (isExternal) {
                anchor.setAttribute('target', '_blank');
                anchor.setAttribute('rel', 'noopener noreferrer');
                return;
            }

            if (href.startsWith("mailto:")) {
                return;
            }

            event.preventDefault();

            // svelte-spa-router uses hash links so this wouldn't work
            if (href.startsWith('#')) {    
                findHeadingByText(node, anchor.textContent ?? '')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                onNavigate?.(href);
            }
        }
    }

    node.addEventListener('click', handleClick);

    return {
        destroy(): void {
            node.removeEventListener('click', handleClick);
        },
    };
}

function normalizeText(text: string): string {
    return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

function findHeadingByText(container: HTMLElement, linkText: string): HTMLElement | null {
    const normalizedLinkText = normalizeText(linkText);
    const headings = container.querySelectorAll<HTMLElement>(HEADING_SELECTOR);

    for (const heading of headings) {
        const normalizedHeadingText = normalizeText(heading.textContent ?? '');
        if (normalizedHeadingText === normalizedLinkText) {
            return heading;
        }
    }

    return null;
}