import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ABMasonryOverlay } from '@/ABMasonryOverlay';
import { ABMasonryItem } from '@/types';
import { ABMasonry } from '@/ABMasonry';
import { mockLoadImage } from './helpers/image-mock';

describe( 'ABMasonryOverlay', () => {
    let gallery: ABMasonry;
    let overlay: ABMasonryOverlay;
    let items: ABMasonryItem[];

    beforeEach( async () => {
        vi.stubGlobal( 'Image', class {
            constructor() {
                return mockLoadImage();
            }
        } );

        document.body.innerHTML = '<div id="gallery"></div>';

        items = [ {
            img: 'https://placehold.co/400x400',
            title: 'Test image',
            caption: 'My caption',
        },
        {
            img: 'https://placehold.co/400x400',
            title: 'Second test image',
            caption: 'My second caption',
            link: 'https://example.com'
        },
        {
            img: 'https://placehold.co/400x400',
            title: 'Third test image',
            caption: 'My third caption',
            link: 'Invalid URL'
        } ];

        gallery = await ABMasonry.create( '#gallery', items );
    } );

    afterEach( () => {
        document.body.innerHTML = '';
    } );

    it( 'opens overlay on image click', () => {
        gallery.render();

        const item = document.querySelector( '.ab-masonry__item' )! as HTMLElement;
        const overlayEl = document.querySelector( '.ab-masonry__overlay' )! as HTMLElement;

        expect( overlayEl ).not.toBeNull();
        expect( overlayEl.classList.contains( 'ab-masonry__overlay__visible' ) ).toBe( false );
    } );

    it( 'opens the overlay on item click', () => {
        gallery.render();

        const itemEl = document.querySelector( '.ab-masonry__item' )!;
        itemEl.dispatchEvent( new Event( 'click', { bubbles: true } ) );

        const overlayEl = document.querySelector( '.ab-masonry__overlay' )!;
        expect( overlayEl.classList.contains( 'ab-masonry__overlay--visible' ) ).toBe( true );
    } );

    it( 'closes the overlay when it is clicked', () => {
        gallery.render();
        const spy = vi.spyOn( gallery[ 'overlay' ] as any, 'resetOverlay' );
        const itemEl = document.querySelector( '.ab-masonry__item' )!;
        itemEl.dispatchEvent( new Event( 'click', { bubbles: true } ) );
        const overlayEl = document.querySelector( '.ab-masonry__overlay' )!;
        overlayEl.dispatchEvent( new Event( 'click', { bubbles: true } ) );

        expect( spy ).toHaveBeenCalled();
        expect( overlayEl.classList.contains( 'ab-masonry__overlay--visible' ) ).toBe( false );
    } );

    it( 'shows plain caption if no URL', () => {
        const overlay = new ABMasonryOverlay();
        overlay.show( items[ 0 ] );

        const figcaption: HTMLElement = document.querySelector( 'figcaption' )!;
        expect( figcaption.textContent ).toBe( 'My caption' );
        expect( figcaption.querySelector( 'a' ) ).toBeNull();
    } );

    it( 'shows caption with link if URL is valid', () => {
        const overlay = new ABMasonryOverlay();
        overlay.show( items[ 1 ] );
        const link = document.querySelector( 'figcaption a' )!;

        expect( link ).not.toBeNull();
        expect( link.textContent ).toBe( 'My second caption' );
        expect( link.getAttribute( 'href' ) ).toBe( 'https://example.com' );
    } );

    it( 'ignores caption link if URL is invalid', () => {
        const overlay = new ABMasonryOverlay();
        overlay.show( items[ 2 ] );

        const figcaption = document.querySelector( 'figcaption' )!;
        expect( figcaption.textContent ).toBe( 'My third caption' );
        expect( figcaption.querySelector( 'a' ) ).toBeNull();
    } );

    it( 'applies zIndex from constructor', () => {
        document.body.innerHTML = '';
        const overlay = new ABMasonryOverlay( 999 );
        const overlayEl = document.querySelector( '.ab-masonry__overlay' )! as HTMLElement;

        expect( overlayEl.style.zIndex ).toBe( '999' );
    } );

    it( 'uses fallback alt text when title and caption are missing', () => {
        const overlay = new ABMasonryOverlay();
        const item = {
            img: 'https://placehold.co/400x300',
        };

        overlay.show( item );
        const img = document.querySelector( '.ab-masonry__modal img' )! as HTMLImageElement;

        expect( img.alt ).toBe( 'ab-masonry' );
    } );
} );
