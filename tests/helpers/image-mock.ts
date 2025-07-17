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
export function mockLoadImage(): HTMLImageElement {
    const img = document.createElement( 'img' );
    img.src = 'https://example.com/image.jpg';
    img.width = 400;
    img.height = 300;
    img.loading = 'lazy';

    setTimeout( () => img.onload?.( new Event( 'load' ) ), 0 );

    return img;
}
