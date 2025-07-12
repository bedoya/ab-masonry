/**
 * Global Image mock for Vitest.
 *
 * Simulates async image loading behavior by triggering `onload`
 * after a short delay. Used in JSDOM test environments to avoid
 * relying on real network image loading.
 *
 * This mock ensures that any `new Image()` used inside components
 * or libraries behaves predictably during tests.
 */
globalThis.Image = class {
    src = '';
    width = 400;
    height = 300;
    loading = 'lazy';
    onload: () => void = () => {
    };
    onerror: () => void = () => {
    };

    constructor() {
        setTimeout( () => this.onload?.(), 5 );
    }
} as unknown as typeof Image;
