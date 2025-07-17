import { ABMasonryColumn } from '@/ABMasonryColumn';

/**
 * ABMasonryRenderer
 * -----------------
 * Handles rendering of masonry layout and event binding (e.g., resize, drag-scroll).
 */
export class ABMasonryRenderer {
    /** The root container where columns will be appended. */
    private readonly container: HTMLElement;

    /** The list of ABMasonryColumn instances to render. */
    private readonly columns: ABMasonryColumn[];

    /** Bound resize event handler for refreshing drag-scroll logic. */
    private readonly onResize: () => void;

    /** Stores cleanup callbacks for drag-scroll event listeners. */
    private dragCleanupFns: Array<() => void> = [];

    /**
     * Creates a new ABMasonryRenderer instance.
     *
     * @param {HTMLElement} container - The root container where columns are rendered.
     * @param {ABMasonryColumn[]} columns - List of column instances to render.
     */
    constructor( container: HTMLElement, columns: ABMasonryColumn[] ) {
        this.container = container;
        this.columns = columns;
        this.onResize = this.handleResize.bind( this );

        window.addEventListener( 'resize', this.onResize );
    }

    /**
     * Appends all columns to the container and sets up drag-scroll if needed.
     */
    public render(): void {
        this.columns.forEach( col => {
            this.container.appendChild( col.container );
        } );

        this.refreshDragScroll();
    }

    /**
     * Called on window resize; refreshes drag-scroll if in mobile view.
     */
    private handleResize(): void {
        this.refreshDragScroll();
    }

    /**
     * Clears existing drag-scroll bindings and re-applies them on mobile (<768px).
     */
    private refreshDragScroll(): void {
        this.dragCleanupFns.forEach( fn => fn() );
        this.dragCleanupFns = [];

        if ( window.innerWidth >= 768 ) {
            return;
        }

        this.container.querySelectorAll( '.ab-masonry__column' ).forEach( col => {
            const cleanup = this.attachDragScroll( col as HTMLElement );
            this.dragCleanupFns.push( cleanup );
        } );
    }

    /**
     * Attaches horizontal drag-to-scroll behavior to a column element.
     *
     * @param {HTMLElement} column The column DOM element.
     * @returns A function to remove all attached listeners.
     */
    private attachDragScroll( column: HTMLElement ): () => void {
        let isDown = false;
        let startX = 0;
        let scrollStart = 0;

        const onMouseDown = ( e: MouseEvent ) => {
            isDown = true;
            startX = e.pageX;
            scrollStart = column.scrollLeft;
            column.classList.add( 'grabbing' );
            e.preventDefault();
        };

        const onMouseMove = ( e: MouseEvent ) => {
            if ( !isDown ) {
                return;
            }
            column.scrollLeft = scrollStart - ( e.pageX - startX );
        };

        const onScroll = () => {
            const atStart = column.scrollLeft <= 1;
            const atEnd = column.scrollLeft + column.offsetWidth >= column.scrollWidth - 1;

            column.classList.toggle( 'scroll-start', atStart );
            column.classList.toggle( 'scroll-end', atEnd );
        };

        const onMouseUp = () => {
            isDown = false;
            column.classList.remove( 'grabbing' );
        };

        column.addEventListener( 'scroll', onScroll );
        column.addEventListener( 'mousedown', onMouseDown );
        document.addEventListener( 'mousemove', onMouseMove );
        document.addEventListener( 'mouseup', onMouseUp );

        return () => {
            column.removeEventListener( 'scroll', onScroll );
            column.removeEventListener( 'mousedown', onMouseDown );
            document.removeEventListener( 'mousemove', onMouseMove );
            document.removeEventListener( 'mouseup', onMouseUp );
        };
    }
}
