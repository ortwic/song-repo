import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { of } from 'rxjs';

// -------------------------------------------------------------------------
// Mock dependencies
// -------------------------------------------------------------------------

vi.mock('svelte-i18n', () => ({
    t: {
        subscribe: (run: (translate: (key: string) => string) => void) => {
            run((key: string) => key);
            return () => {};
        }
    }
}));

vi.mock('firebase/analytics', () => ({
    getAnalytics: vi.fn().mockReturnValue({ logEvent: vi.fn() })
}));

vi.mock('./src/service/base/firebase.setup', () => ({
    app: {},
    auth: {}
}));

vi.mock('./src/service/user/auth.service', () => ({
    currentUser: of({ 
        uid: 'uid-123', 
        displayName: 'John Doe', 
        email: 'john@example.com', 
        photoURL: 'https://example.com/photo.jpg' 
    })
}));


// -------------------------------------------------------------------------
// Polyfills for not available props in happy-dom
// -------------------------------------------------------------------------

Object.defineProperty(window, 'visualViewport', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
        offsetLeft: 0,
        offsetTop: 0,
        width: 800,
        height: 600
    }))
});

Element.prototype.animate = vi.fn().mockImplementation(() => ({
    cancel: vi.fn(),
    finish: vi.fn(),
    play: vi.fn(),
    pause: vi.fn(),
    reverse: vi.fn(),
    finished: Promise.resolve(),
    onfinish: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
}));

