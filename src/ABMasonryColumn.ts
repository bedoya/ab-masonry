import { ABMasonryElement } from '@/ABMasonryElement';

/**
 * ABMasonryColumn
 * ----------------
 * Represents a single column in the masonry layout.
 *
 * Responsible for managing its own DOM container and tracking
 * the cumulative height of appended elements to assist in layout balancing.
 */
export class ABMasonryColumn {
    /** The DOM container for this column. */
    public readonly container: HTMLDivElement;

    /** The cumulative height of all elements in this column. */
    private height: number = 0;

    /**
     * Creates a new ABMasonryColumn instance with an empty container.
     * Initializes internal state and prepares the column for item insertion.
     */
    constructor() {
        this.container = this.createContainer();
    }

    /**
     * Creates the HTML container element representing this column.
     * Applies the appropriate CSS class for styling.
     *
     * @returns {HTMLDivElement} A new div element with class 'ab-masonry__column'.
     */
    private createContainer(): HTMLDivElement {
        let container: HTMLDivElement = document.createElement( 'div' );
        container.className = 'ab-masonry__column';

        return container;
    }

    /**
     * Appends a masonry element to the column and updates its total height.
     *
     * @param {ABMasonryElement} element The ABMasonryElement to append.
     */
    public appendElement( element: ABMasonryElement ): void {
        this.container.appendChild( element.getElement() );

        this.height += element.getHeight();
    }

    /**
     * Returns the total vertical height of the column,
     * used for balancing item distribution.
     *
     * @returns {number} The cumulative height of all items in the column.
     */
    public getHeight(): number {
        return this.height;
    }
}