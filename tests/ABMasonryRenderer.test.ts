import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ABMasonryItem } from '@/types';
import { ABMasonry } from '@/ABMasonry';
import { mockLoadImage } from './helpers/image-mock';

describe( 'ABMasonryRenderer', () => {
    let gallery: ABMasonry;
    let items: ABMasonryItem[];

    beforeEach( async () => {
        vi.stubGlobal( 'Image', class {
            constructor() {
                return mockLoadImage();
            }
        } );

        document.body.innerHTML = '<div id="gallery"></div>';

        items = [
            { img: 'https://placehold.co/400x400', title: 'Test image', caption: 'My caption' },
            { img: 'https://placehold.co/400x400', title: 'Second test image', caption: 'My second caption', link: 'https://example.com' },
            { img: 'https://placehold.co/400x400', title: 'Third test image', caption: 'My third caption', link: 'Invalid URL' }
        ];

    } );

    afterEach( () => {
        document.body.innerHTML = '';
    } );

    it( 'appends all columns to the container', async () => {
        gallery = await ABMasonry.create( '#gallery', items );
        gallery.render();

        const columnCount = document.querySelectorAll( '.ab-masonry__column' ).length;
        expect( columnCount ).toBeGreaterThan( 0 );
    } );

    it( 'calls refreshDragScroll on window resize', async () => {
        gallery = await ABMasonry.create( '#gallery', items );
        gallery.render();
        const spy = vi.spyOn( gallery[ 'renderer' ] as any, 'refreshDragScroll' );
        window.dispatchEvent( new Event( 'resize' ) );

        expect( spy ).toHaveBeenCalled();
        spy.mockRestore();
    } );

    it( 'toggles scroll-start and scroll-end classes on scroll', async () => {
        vi.stubGlobal( 'innerWidth', 767 );
        gallery = await ABMasonry.create( '#gallery', items );
        gallery.render();

        const column = document.querySelector( '.ab-masonry__column' ) as HTMLElement;

        Object.defineProperty( column, 'offsetWidth', { value: 100, configurable: true } );
        Object.defineProperty( column, 'scrollWidth', { value: 300, configurable: true } );

        column.scrollLeft = 0;
        column.dispatchEvent( new Event( 'scroll' ) );
        expect( column.classList.contains( 'scroll-start' ) ).toBe( true );
        expect( column.classList.contains( 'scroll-end' ) ).toBe( false );

        column.scrollLeft = 100;
        column.dispatchEvent( new Event( 'scroll' ) );
        expect( column.classList.contains( 'scroll-start' ) ).toBe( false );
        expect( column.classList.contains( 'scroll-end' ) ).toBe( false );

        column.scrollLeft = 200;
        column.dispatchEvent( new Event( 'scroll' ) );
        expect( column.classList.contains( 'scroll-end' ) ).toBe( true );
    } );

    it( 'attaches drag-scroll to columns on mobile view', async () => {
        vi.stubGlobal( 'innerWidth', 767 );
        gallery = await ABMasonry.create( '#gallery', items, { columns: 1 } );
        gallery.render();

        const renderer = gallery[ 'renderer' ] as any;
        const column = document.querySelector( '.ab-masonry__column' ) as HTMLElement;
        const spy = vi.spyOn( renderer, 'attachDragScroll' );

        renderer[ 'refreshDragScroll' ]();

        expect( spy ).toHaveBeenCalledTimes( 1 );
        expect( spy ).toHaveBeenCalledWith( column );
    } );

    it( 'sets up drag-scroll on mousedown', async () => {
        vi.stubGlobal( 'innerWidth', 767 );
        gallery = await ABMasonry.create( '#gallery', items, { columns: 1 } );
        gallery.render();

        const column = document.querySelector( '.ab-masonry__column' ) as HTMLElement;
        const event = new MouseEvent( 'mousedown', {
            bubbles: true,
            cancelable: true,
            clientX: 100,
        } );

        column.dispatchEvent( event );

        expect( column.classList.contains( 'grabbing' ) ).toBe( true );
    } );

    it( 'scrolls column on mousemove after mousedown', async () => {
        vi.stubGlobal( 'innerWidth', 767 );
        gallery = await ABMasonry.create( '#gallery', items, { columns: 1 } );
        gallery.render();

        const column = document.querySelector( '.ab-masonry__column' ) as HTMLElement;
        const renderer = gallery[ 'renderer' ] as any;

        const initialScroll = 100;
        column.scrollLeft = initialScroll;

        column.dispatchEvent( new MouseEvent( 'mousedown', {
            bubbles: true,
            cancelable: true,
            clientX: 200
        } ) );

        renderer[ 'isDown' ] = true;
        renderer[ 'startX' ] = 200;
        renderer[ 'scrollStart' ] = initialScroll;

        document.dispatchEvent( new MouseEvent( 'mousemove', {
            bubbles: true,
            cancelable: true,
            clientX: 180
        } ) );

        expect( column.scrollLeft ).toBe( initialScroll + 20 );
    } );

    it( 'removes grabbing class on mouse up', async () => {
        vi.stubGlobal( 'innerWidth', 767 );
        gallery = await ABMasonry.create( '#gallery', items, { columns: 1 } );
        gallery.render();

        const column = document.querySelector( '.ab-masonry__column' ) as HTMLElement;

        const event = new MouseEvent( 'mousedown', { bubbles: true } );
        Object.defineProperty( event, 'pageX', { value: 50 } );
        column.dispatchEvent( event );

        expect( column.classList.contains( 'grabbing' ) ).toBe( true );

        document.dispatchEvent( new MouseEvent( 'mouseup', { bubbles: true } ) );
        expect( column.classList.contains( 'grabbing' ) ).toBe( false );
    } );
} );
