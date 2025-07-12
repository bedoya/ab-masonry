import type { ABMasonryItem, ABMasonryOptions } from '@/types';
import { ABMasonryDefaultOptions } from '@/defaults';
import '@/ab-masonry.css';

/**
 * ABGallery
 * ----------
 * Lightweight, dependency-free masonry image gallery.
 *
 * Features:
 * - Responsive column layout
 * - Proportional image scaling using background-image
 * - Automatic balancing of column height
 * - Optional image descriptions (with overlay on image and modal viewer)
 * - Full-size viewer with smooth transitions
 *
 * Usage:
 * ```ts
 * const gallery = new ABGallery('#gallery', images, { cols: 3 });
 * ```
 *
 * Parameters:
 * - selector: CSS selector for the container (e.g. '#gallery')
 * - items: array of ABMasonryItem { url, description?, link? }
 * - options: { cols?: number, gap?: string, ... }
 *
 * CSS:
 * Ensure you include the `.ab-masonry`, `.ab-masonry__item`, `.ab-masonry__overlay`, etc.
 * All styles inherit from `.ab-masonry`.
 */
export class ABMasonry {
    /**
     * The container element where the gallery will be rendered.
     */
    private container: HTMLElement;

    /**
     * The list of image items to render in the gallery.
     */
    private items: ABMasonryItem[];

    /**
     * Normalized options including column count, gap, etc.
     */
    private options: Required<ABMasonryOptions>;

    /**
     * Array of column containers used to arrange the masonry layout.
     */
    private columns: HTMLDivElement[] = [];

    /**
     * Tracks the cumulative height of each column for balancing.
     */
    private readonly columnHeights: number[] = [];

    /**
     * The fullscreen overlay used for displaying enlarged images.
     */
    private readonly overlay: HTMLDivElement;

    /**
     * Creates a new masonry gallery instance and renders it into the given container.
     *
     * @param {string} selector A CSS selector string to identify the container element (e.g. '#gallery').
     * @param {ABMasonryItem[]} items An array of image items to display. Each item includes a URL and optional description/link.
     * @param {ABMasonryOptions} options Optional configuration object to override default settings (columns, gap, lazy load).
     *
     * @throws Error if the container element is not found in the DOM.
     */
    constructor( selector: string, items: ABMasonryItem[], options: ABMasonryOptions = {} ) {
        const element = document.querySelector<HTMLElement>( selector );
        if ( !element ) {
            throw new Error( `Container "${ selector }" not found` );
        }
        this.container = element;
        this.items = items;
        this.options = { ...ABMasonryDefaultOptions, ...options };
        this.columnHeights = Array( this.options.columns ).fill( 0 );

        this.overlay = this.createOverlay();
        document.body.appendChild( this.overlay );

        this.render();
    }

    /**
     * Renders the masonry gallery by:
     * - Creating the column containers
     * - Loading and inserting each image into the shortest column
     * - Adjusting column heights dynamically as images load
     *
     * Called automatically during construction.
     * Can be called manually to re-render with current items/options.
     */
    private render(): void {
        this.columns = this.addColumns( this.options.columns );

        this.items.forEach( async item => {
            const element: HTMLDivElement | null = await this.createItemContainer( item );
            if ( !element ) {
                return;
            }
            const idx = this.getShortestColumnIndex();
            this.columns[ idx ].appendChild( element );
            this.columnHeights[ idx ] += element.getBoundingClientRect().height;
        } );
        this.columns.forEach( col => this.container.appendChild( col ) );
        console.log( '[Rendering]', { options: this.options, items: this.items, element: this.container, columns: this.columns } );
    }

    /**
     * Builds a masonry item div once the image is loaded.
     *
     * Workflow:
     * 1. Pre‑loads the image to obtain its natural dimensions.
     * 2. Creates a `<div>` with the image as `background-image`.
     * 3. Scales the div to the column width while preserving aspect ratio.
     * 4. Adds a caption overlay if the item has `description`.
     *
     * @param {ABMasonryItem} item The image data (url, description, link).
     *
     * @returns {Promise<HTMLDivElement | null>} A Promise that resolves to the fully‑styled
     *                                           `<div>` or `null` if the image fails to load.
     */
    private createItemContainer( item: ABMasonryItem ): Promise<HTMLDivElement | null> {
        return new Promise( resolve => {
            const img: HTMLImageElement = new Image();
            img.src = item.url;
            img.loading = 'lazy';

            img.onload = () => {
                const container: HTMLDivElement = document.createElement('div');
                container.className = 'ab-masonry__item';
                container.appendChild( this.createImageElement( img ) );
                if ( item.description ) {
                    container.appendChild( this.buildCaption( item.description ) );
                }
                container.addEventListener( 'click', () => {
                    this.showOverlay( item );
                } );

                resolve( container );
            };

            img.onerror = () => resolve( null );
        } );
    }

    /**
     * Creates the visual container for a single image item.
     *
     * Uses a `div` with `background-image` instead of `<img>` for layout control.
     * Sets the correct size based on the image's aspect ratio and column width.
     * Optionally adds a caption overlay if `description` is provided.
     *
     * @param {HTMLImageElement} img A preloaded HTMLImageElement used to extract dimensions.
     *
     * @returns {HTMLDivElement} A styled `<div>` representing the image in the gallery.
     */
    private createImageElement( img: HTMLImageElement ): HTMLImageElement {
        img.style.width  = '100%';
        img.style.height = 'auto';

        return img;
    }

    /**
     * Creates a caption overlay element for a masonry item.
     *
     * @param text The caption text to display.
     *
     * @returns {HTMLDivElement} A `<div>` element styled as an overlay caption.
     */
    private buildCaption( text: string ): HTMLDivElement {
        const caption: HTMLDivElement = document.createElement( 'div' );
        caption.className = 'ab-masonry__caption';
        caption.textContent = text;
        return caption;
    }

    /**
     * Finds the column with the smallest accumulated height.
     *
     * @returns {number} The zero‑based index of the shortest column in `this.columnHeights`.
     */
    private getShortestColumnIndex(): number {
        const min: number = Math.min( ...this.columnHeights );
        return this.columnHeights.indexOf( min );
    }

    /**
     * Creates and appends the specified number of columns to the container.
     *
     * Each column is a `<div>` with class `ab-masonry__column`. The `gap` option is applied via CSS.
     *
     * @param {number} count - Number of columns to create.
     *
     * @returns {HTMLDivElement[]} An array of the created column `<div>` elements.
     */
    private addColumns( count: number ): HTMLDivElement[] {
        this.container.className = 'ab-masonry';
        this.container.innerHTML = '';

        const columns: HTMLDivElement[] = [];

        for ( let i: number = 0; i < count; i++ ) {
            const column: HTMLDivElement = document.createElement( 'div' );
            column.className = 'ab-masonry__column';
            this.container.appendChild( column );
            columns.push( column );
        }

        return columns;
    }

    /**
     * Builds the fullscreen overlay element used for the enlarged‑image viewer.
     *
     * The overlay is initially hidden (`opacity: 0`) and becomes visible by toggling
     * the `ab-masonry__overlay--visible` class. Clicking anywhere on the overlay
     * closes it.
     *
     * @returns {HTMLDivElement} A `<div>` element ready to be appended to `document.body`.
     */
    private createOverlay(): HTMLDivElement {
        let overlay: HTMLDivElement = document.createElement( 'div' );
        document.documentElement.style.setProperty( '--ab-masonry-overlay-z', this.options.overlayZIndex.toString() );

        overlay.className = 'ab-masonry__overlay';

        overlay.addEventListener( 'click', () => {
            overlay.classList.remove( 'ab-masonry__overlay--visible' );
        } );

        return overlay;
    }

    /**
     * Displays the fullscreen overlay with the selected image and its description.
     *
     * Replaces the overlay’s content with a centered `<figure>` containing the image
     * and optional caption, and makes the overlay visible via CSS class toggle.
     *
     * @param {ABMasonryItem} item - The image item to display in the overlay.
     */
    private showOverlay( item: ABMasonryItem ): void {
        this.overlay.innerHTML = '';

        const modal: HTMLElement = document.createElement( 'figure' );
        modal.className = 'ab-masonry__modal';

        const image: HTMLImageElement = document.createElement( 'img' );
        image.src = item.url;
        image.alt = item.description ?? '';
        modal.appendChild( image );

        if ( item.description ) {
            const caption: HTMLElement = document.createElement( 'figcaption' );
            caption.textContent = item.description;
            modal.appendChild( caption );
        }

        this.overlay.appendChild( modal );
        this.overlay.classList.add( 'ab-masonry__overlay--visible' );
        this.overlay.style.display = 'flex';
    }

}
