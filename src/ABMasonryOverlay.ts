import { ABMasonryItem } from '@/types';
import { ABMasonryDefaultOptions } from '@/defaults';

/**
 * Handles the creation and display of an overlay modal for masonry items.
 *
 * The overlay includes a full-size image and optional caption with a link.
 * It's shown when an item is clicked and hidden when the overlay itself is clicked.
 *
 * Usage:
 *   const overlay = new ABMasonryOverlay();
 *   overlay.show(item); // ABMasonryItem
 *
 * Features:
 * - Dynamically builds the overlay DOM structure.
 * - Applies configurable z-index.
 * - Validates links before rendering anchors.
 * - Prevents XSS via URL validation.
 */
export class ABMasonryOverlay {
    /** Root overlay element appended to <body> and used to display the modal. */
    private readonly overlay: HTMLElement;

    /** Modal container inside the overlay, contains the image and optional caption. */
    private readonly modal?: HTMLElement;

    /**
     * Initializes the overlay with an optional z-index.
     * Creates and appends the overlay/modal to the document.
     *
     * @param {number} zIndex The z-index to apply to the overlay.
     */
    constructor( zIndex: number = ABMasonryDefaultOptions.overlayZIndex ) {
        this.overlay = this.createOverlay( zIndex.toString() );
        this.modal = this.createModal();
        this.overlay.appendChild( this.modal );

        document.body.appendChild( this.overlay );
        this.overlay.addEventListener( 'click', () => this.hide() );
    }

    /**
     * Creates the overlay container element with the given z-index.
     *
     * @param {string} zIndex The z-index as string.
     *
     * @returns {HTMLDivElement} The overlay element.
     */
    private createOverlay( zIndex: string ): HTMLDivElement {
        let overlay: HTMLDivElement = document.createElement( 'div' );
        overlay.classList.add( 'ab-masonry__overlay' );
        overlay.style.zIndex = zIndex.toString();

        return overlay;
    }

    /**
     * Creates the modal element that will contain the image and caption.
     *
     * @returns {HTMLElement} The modal figure element.
     */
    private createModal(): HTMLElement {
        let modal: HTMLElement = document.createElement( 'figure' );
        modal.className = 'ab-masonry__modal';

        return modal;
    }

    /**
     * Removes all content from the modal.
     *
     * @returns {void}
     */
    private resetOverlay() {
        if ( this.modal ) {
            this.modal.innerHTML = '';
        }
    }

    /**
     * Updates the modal content based on the given masonry item.
     *
     * @param {ABMasonryItem} item The masonry item containing image and caption data.
     */
    private updateModal( item: ABMasonryItem ): void {
        this.setImage( item.img, item.title ?? item.caption ?? 'ab-masonry' );
        if( item.caption != undefined && item.caption != '' ) {
            this.setCaption( item.caption, item.link );
        }
    }

    /**
     * Appends the image element to the modal.
     *
     * @param {string} url The image source URL.
     * @param {string} title The alt/title text for the image.
     *
     * @returns {void}
     */
    private setImage( url: string, title: string ): void {
        const img: HTMLImageElement = document.createElement( 'img' );
        img.src = url;
        img.alt = title;
        this.modal!.appendChild( img );
    }

    /**
     * Appends a caption to the modal.
     * If a valid link is provided, wraps the caption in an anchor.
     *
     * @param {string} text The caption text.
     * @param {string} [link] Optional link URL.
     *
     * @returns {void}
     */
    private setCaption( text: string, link?: string ) {
        const caption = document.createElement( 'figcaption' );

        if ( text ) {
            if ( this.validUrl( link ) ) {
                const a = document.createElement( 'a' );
                a.href = link!;
                a.textContent = text;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                caption.appendChild( a );
            }
            else {
                caption.textContent = text;
            }
            this.modal!.appendChild( caption );
        }
    }

    /**
     * Validates whether the given string is a valid URL.
     *
     * @param {string} [value] The URL string to validate.
     *
     * @returns {boolean} True if valid URL, otherwise false.
     */
    private validUrl( value?: string ): boolean {
        try {
            return !!value && Boolean( new URL( value ) );
        }
        catch {
            return false;
        }
    }

    /**
     * Displays the overlay with the given masonry item content.
     *
     * @param {ABMasonryItem} item The item to show in the overlay.
     *
     * @returns {void}
     */
    public show( item: ABMasonryItem ): void {
        this.updateModal( item );
        this.overlay.classList.add( 'ab-masonry__overlay--visible' );
    }

    /**
     * Hides the overlay and clears its content.
     *
     * @returns {void}
     */
    public hide(): void {
        this.resetOverlay();
        this.overlay.classList.remove( 'ab-masonry__overlay--visible' );
    }
}
