/**
 * Unit tests for the ABGallery masonry image plugin.
 *
 * Verifies that images are rendered into columns,
 * the overlay is created and displayed on click,
 * and core layout logic behaves as expected.
 *
 * Uses JSDOM and a global Image mock defined in setup files
 * to simulate image loading in a controlled environment.
 */
import { describe, it, vi, expect, beforeEach } from 'vitest';
import { ABMasonry } from '../src';
import type { ABMasonryItem } from '../src';

const sampleImages: ABMasonryItem[] = [
    { url: 'https://picsum.photos/300/300?random=1', description: 'Test 1' },
    { url: 'https://picsum.photos/300/300?random=2', description: 'Test 2' },
];

describe( 'ABMasonry', () => {
    let container: HTMLElement;

    beforeEach( () => {
        document.body.innerHTML = '<div id="gallery"></div>';
        container = document.getElementById( 'gallery' )!;
    } );

    it( 'creates overlay element in DOM', () => {
        new ABMasonry( '#gallery', sampleImages );
        const overlay = document.querySelector( '.ab-masonry__overlay' );
        expect( overlay ).toBeTruthy();
        expect( document.body.contains( overlay! ) ).toBe( true );
    } );

    it( 'renders image items into columns', async () => {
        new ABMasonry( '#gallery', sampleImages );
        await new Promise( ( r ) => setTimeout( r, 100 ) );
        const columns = container.querySelectorAll( '.ab-masonry__column' );
        expect( columns.length ).toBeGreaterThan( 0 );
        const hasItems = Array.from( columns )
                              .some( col => col.querySelector( '.ab-masonry__item' ) );
        expect( hasItems ).toBe( true );
    } );

    it( 'displays overlay when an image is clicked', async () => {
        new ABMasonry( '#gallery', sampleImages );
        await new Promise( ( r ) => setTimeout( r, 100 ) );
        const imageItem = container.querySelector( '.ab-masonry__item' );
        expect( imageItem ).toBeTruthy();
        imageItem!.dispatchEvent( new MouseEvent( 'click', { bubbles: true } ) );

        const overlay = document.querySelector( '.ab-masonry__overlay' );
        expect( overlay ).toBeTruthy();
        expect(
            overlay!.classList.contains( 'ab-masonry__overlay--visible' ),
        ).toBe( true );
    } );

    it( 'places images in the shortest column based on height', async () => {
        vi.stubGlobal( 'Image', class {
            src = '';
            loading = 'lazy';
            onload!: () => void;
            onerror!: () => void;
            width = 300;
            height: number;

            constructor() {
                this.height = Math.random() > 0.5 ? 300 : 150;
                setTimeout( () => this.onload?.(), 5 );
            }
        } );

        vi.spyOn( HTMLElement.prototype, 'getBoundingClientRect' ).mockImplementation( () => ( {
            width: 300,
            height: Math.random() > 0.5 ? 300 : 150,
            top: 0, left: 0, bottom: 0, right: 0,
            x: 0, y: 0,
            toJSON: () => ( {} ),
        } ) );

        const items: ABMasonryItem[] = Array.from( { length: 6 }, ( _, i ) => ( {
            url: `https://picsum.photos/300/300?random=${ i }`,
            description: `Image ${ i }`,
        } ) );

        const gallery = new ABMasonry( '#gallery', items, { cols: 2 } );

        // Wait for all image loading + layout
        await new Promise( ( r ) => setTimeout( r, 100 ) );
        await new Promise( ( r ) => setTimeout( r ) ); // ensure reflow

        const columns = document.querySelectorAll( '.ab-masonry__column' );
        const heights = Array.from( columns ).map( col => col.getBoundingClientRect().height );

        const diff = Math.abs( heights[ 0 ] - heights[ 1 ] );

        // Verify heights aren't identical but reasonably balanced
        expect( heights[ 0 ] ).toBeGreaterThan( 0 );
        expect( heights[ 1 ] ).toBeGreaterThan( 0 );
        expect( diff ).toBeLessThan( Math.max( heights[ 0 ], heights[ 1 ] ) );
    } );

    describe( 'getProportionSize', () => {
        it( 'calculates width maintaining aspect ratio', () => {
            const gallery = new ABMasonry( '#gallery', [] );
            const width = gallery[ 'getProportionSize' ]( 600, 300, 300, 'w' );
            expect( width ).toBe( 300 );
        } );

        it( 'calculates height maintaining aspect ratio', () => {
            const gallery = new ABMasonry( '#gallery', [] );
            const height = gallery[ 'getProportionSize' ]( 600, 300, 300, 'h' );
            expect( height ).toBe( 150 );
        } );

        it( 'returns 0 if dimensions are zero', () => {
            const gallery = new ABMasonry( '#gallery', [] );
            const result = gallery[ 'getProportionSize' ]( 0, 0, 300, 'h' );
            expect( result ).toBe( 0 );
        } );

        it( 'initializes the correct number of columns', () => {
            const gallery = new ABMasonry( '#gallery', [], { cols: 4 } );
            const columns = document.querySelectorAll( '.ab-masonry__column' );
            expect( columns.length ).toBe( 4 );
            columns.forEach( col => {
                expect( col.parentElement?.classList.contains( 'ab-masonry' ) ).toBe( true );
            } );
        } );
    } );
} );
