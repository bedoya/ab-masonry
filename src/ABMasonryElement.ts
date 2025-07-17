import { ABMasonryItem } from '@/types';

/**
 * ABMasonryElement
 * -----------------
 * Represents a single visual item in the masonry gallery.
 *
 * Encapsulates an image with optional caption and provides access
 * to its DOM element and rendered height.
 */
export class ABMasonryElement {
    /** The original item data passed for this element. */
    public readonly item: ABMasonryItem;

    /** The DOM container for this element, including image and caption. */
    private readonly container: HTMLDivElement;

    /** The calculated display height of the element (used for layout). */
    private height: number = 0;

    /**
     * Creates a new ABMasonryElement instance.
     *
     * @param {ABMasonryItem} item The data associated with the element.
     * @param {HTMLDivElement} container The prebuilt DOM container.
     */
    constructor( item: ABMasonryItem, container: HTMLDivElement ) {
        this.item = item;
        this.container = container;
    }

    /**
     * Asynchronously builds a new ABMasonryElement from item data.
     *
     * @param {ABMasonryItem} data The item containing image URL and optional caption.
     * @param {number} width The width used to calculate proportional height.
     * @param {() => void} [onClick] Optional callback executed when the element is clicked.
     *
     * @returns {Promise<ABMasonryElement>} A fully constructed ABMasonryElement.
     * @throws Error if image fails to load or is invalid.
     */
    static async create( data: ABMasonryItem, width: number, onClick?: () => void ): Promise<ABMasonryElement> {
        let container: HTMLDivElement;
        try {
            data.img = this.validateImgUrl( data.img );
            const img: HTMLImageElement = await this.loadImage( data );
            container = this.createContainer( img, data );
            const element: ABMasonryElement = new ABMasonryElement( data, container );
            element.height = this.calculateProportionalSize( img.naturalWidth, img.naturalHeight, width, 'h' );
            if( onClick ) {
                element.container.addEventListener( 'click', onClick );
            }

            return element;
        }
        catch ( error ) {
            throw new Error( `Failed to create ABMasonryElement: ${ ( error as Error ).message }` );
        }
    }

    /**
     * Validates that the image URL is either absolute or relative.
     *
     * @param {string} url The image URL to validate.
     *
     * @returns {string} The same URL if valid.
     * @throws Error if the URL is not valid.
     */
    private static validateImgUrl( url: string ): string {
        if ( !url.startsWith( '/' ) && !/^https?:\/\//.test( url ) ) {
            throw new Error( 'Invalid ABMasonryItem: "img" must be a relative or absolute URL' );
        }

        return url;
    }

    /**
     * Loads an image and returns it as an HTMLImageElement.
     *
     * @param {ABMasonryItem} item
     *
     * @returns {Promise<HTMLImageElement>} A promise resolving with the loaded image.
     */
    private static loadImage( item: ABMasonryItem ): Promise<HTMLImageElement> {
        return new Promise( ( resolve, reject ) => {
            const img: HTMLImageElement = new Image();
            img.src = item.img;
            img.onload = () => {
                img.alt = item.title ?? item.caption ?? 'ab-masonry item';
                resolve( img );
            }
            img.onerror = () => {
                reject( new Error( `Image failed to load: ${ item.img }` ) );
            }
        } );
    }

    /**
     * Creates the DOM container element for this item.
     *
     * @param img The loaded image element.
     * @param data The item data used to build metadata (e.g. caption).
     *
     * @returns {HTMLDivElement} A complete div container for the element.
     */
    private static createContainer( img: HTMLImageElement, data: ABMasonryItem ): HTMLDivElement {
        const container: HTMLDivElement = document.createElement( 'div' );
        container.className = 'ab-masonry__item';
        container.appendChild( img );
        if ( data.title ?? data.caption ) {
            container.appendChild( this.buildCaption( data ) );
        }
        return container;
    }

    /**
     * Builds the caption element for the given text.
     *
     * @param {ABMasonryItem} data
     *
     * @returns {HTMLDivElement} A styled caption container.
     */
    private static buildCaption( data: ABMasonryItem ): HTMLDivElement {
        const caption: HTMLDivElement = document.createElement( 'div' );
        caption.className = 'ab-masonry__caption';
        caption.textContent = data.title ?? data.caption ?? '';
        return caption;
    }

    /**
     * Calculates the proportional width or height based on target and natural dimensions.
     *
     * @param {number} naturalWidth Original image width in pixels
     * @param {number} naturalHeight Original image height in pixels
     * @param {number} target Target size for the given direction
     * @param {string} direction 'w' for width, 'h' for height
     *
     * @returns {number} Scaled dimension in pixels
     */
    private static calculateProportionalSize(
        naturalWidth: number,
        naturalHeight: number,
        target: number,
        direction: 'w' | 'h'
    ): number {
        if ( direction === 'w' ) {
            return Math.round( ( naturalWidth / naturalHeight ) * target );
        }
        else {
            return Math.round( ( naturalHeight / naturalWidth ) * target );
        }
    }

    /**
     * Returns {HTMLDivElement} the DOM container of this element.
     */
    public getElement(): HTMLDivElement {
        return this.container;
    }

    /**
     * @returns {number} The rendered height of the element in pixels.
     */
    public getHeight(): number {
        return this.height;
    }

}