import { ABMasonryItem, ABMasonryOptions } from '@/types';
import { ABMasonryDefaultOptions } from '@/defaults';
import { ABMasonryColumn } from '@/ABMasonryColumn';
import { ABMasonryElement } from '@/ABMasonryElement';
import { ABMasonryRenderer } from '@/ABMasonryRenderer';
import { ABMasonryOverlay } from '@/ABMasonryOverlay';

/**
 * ABGallery
 * ----------
 * Lightweight, dependency-free masonry image gallery.
 *
 * Parameters:
 * - selector: CSS selector for the container (e.g. '#gallery')
 * - items: array of ABMasonryItem { url, description?, link? }
 * - options: { cols?: number, gap?: string, ... }
 */
export class ABMasonry {
    /**
     * The container element where the gallery will be rendered.
     */
    private readonly container: HTMLElement;

    /**
     * The list of image items to render in the gallery.
     */
    private readonly items!: ABMasonryItem[];

    /**
     * Normalized options including column count, gap, etc.
     */
    private options: Required<ABMasonryOptions>;

    /**
     * The columns of the gallery or rows if it is in horizontal view
     */
    private columns!: ABMasonryColumn[];

    /**
     * Responsible for injecting the column layout into the container.
     */
    private renderer!: ABMasonryRenderer;

    /**
     * Overlay component used to display full-size images with optional caption/link.
     */
    private overlay: ABMasonryOverlay;

    /**
     * Private constructor. Use `ABMasonry.create()` to instantiate.
     *
     * @param {string | HTMLElement} selector The selector where the Gallery will live
     * @param {ABMasonryItem[]} items An array of items to be displayed on the gallery
     * @param {ABMasonryOptions} options The configuration options of the Gallery
     * @private
     */
    private constructor( selector: string | HTMLElement, items: ABMasonryItem[], options: ABMasonryOptions = {} ) {
        this.container = this.resolveContainer( selector );
        this.items = items;
        this.options = { ...ABMasonryDefaultOptions, ...options } as Required<ABMasonryOptions>;

        this.overlay = new ABMasonryOverlay( this.options.overlayZIndex );
    }

    /**
     * Resolves a valid container element from a selector or HTMLElement.
     *
     * @param {string | HTMLElement} selector - A CSS selector string or an HTMLElement reference.
     *
     * @returns {HTMLElement} The resolved HTMLElement.
     * @throws If the selector is a string and no matching element is found.
     */
    private resolveContainer( selector: string | HTMLElement ): HTMLElement {
        if ( selector instanceof HTMLElement ) {
            return selector;
        }

        const element = document.querySelector<HTMLElement>( selector );
        if ( !element ) {
            throw new Error( `Container "${ selector }" not found` );
        }

        return element;
    }

    /**
     * Initializes columns and distributes all items across them.
     */
    private async build() {
        this.container.classList.add( 'ab-masonry' );
        this.columns = this.createColumns( this.options.columns );

        await this.distributeItems();
    }

    /**
     * Distributes all valid items across columns,
     * balancing based on current column heights.
     */
    private async distributeItems() {
        for ( const item of this.items ) {
            try {
                const columnWidth: number = ( this.container.clientWidth > 0 ) ?
                    ( this.container.clientWidth / this.options.columns ):
                    ( 1024 / this.options.columns );
                const element: ABMasonryElement = await ABMasonryElement.create( item, columnWidth, () => this.overlay.show( item ) );

                this.columns[ this.getShortestColumn() ].appendElement( element );
            }
            catch ( error ) {
                console.warn( '[ABMasonry] Skipped item due to error:', item, error );
            }
        }
    }

    /**
     * Creates and returns the specified number of empty columns.
     *
     * @param {number} columns Number of columns to create
     */
    private createColumns( columns: number = 3 ): ABMasonryColumn[] {
        return Array.from( { length: columns }, () => new ABMasonryColumn() );
    }

    /**
     * Returns the index of the column with the least current height.
     *
     * @returns {number}
     */
    private getShortestColumn(): number {
        let shortest = 0;

        for ( let i = 1; i < this.columns.length; i++ ) {
            shortest = ( this.columns[ i ].getHeight() < this.columns[ shortest ].getHeight() ) ? i : shortest;
        }

        return shortest;
    }

    /**
     * Asynchronously creates and builds a new ABMasonry instance.
     *
     * @param {string | HTMLElement} selector CSS selector for the container element
     * @param {ABMasonryItem[]} items Array of image items to render
     * @param {ABMasonryOptions} options Optional configuration overrides
     *
     * @returns A fully initialized ABMasonry instance
     */
    static async create( selector: string | HTMLElement, items: ABMasonryItem[], options: ABMasonryOptions = {} ): Promise<ABMasonry> {
        const instance: ABMasonry = new ABMasonry( selector, items, options );
        await instance.build();
        return instance;
    }

    /**
     * Renders the masonry layout by injecting columns into the container.
     * Also applies gap styles and initializes the renderer.
     */
    public render() {
        this.container.style.setProperty( '--ab-gap', `${ this.options.gap.toString() || 16 }px` );
        this.renderer = new ABMasonryRenderer( this.container, this.columns );
        this.renderer.render();
    }
}