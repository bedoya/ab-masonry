import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ABMasonry } from '@/index';
import { ABMasonryItem } from '@/types';
import { ABMasonryElement } from '@/ABMasonryElement';
import { mockLoadImage } from './helpers/image-mock';

let length: number = 3;
let items: ABMasonryItem[] = [];
let columns: number = 3;

vi.spyOn( ABMasonryElement as any, 'loadImage' ).mockResolvedValue( mockLoadImage() );

describe( 'ABMasonry (integration test)', () => {
    beforeEach( () => {
        length = Math.floor( Math.random() * 21 ) + 3;

        items = Array.from( { length }, ( _, i ) => ( {
            img: `https://example.com/image-${ i + 1 }.jpg`,
            description: `Image ${ i + 1 }`,
        } ) );

        document.body.innerHTML = '<div id="gallery"></div>';
    } );

    it( 'throws an error if the selector does not match any element', async () => {
        await expect( ABMasonry.create( '#nonexistent', items ) )
            .rejects
            .toThrow( 'Container "#nonexistent" not found' );
    } );

    it( 'resolves an HTMLElement directly', async () => {
        const gallery = await ABMasonry.create( "#gallery", items );
        expect( gallery ).toBeInstanceOf( ABMasonry );
    } );

    it( 'resolves an HTMLElement from selector', async () => {
        const container = document.querySelector( '#gallery' ) as HTMLElement;
        const gallery = await ABMasonry.create( container, items );
        expect( gallery ).toBeInstanceOf( ABMasonry );
    } );

    it( 'creates the correct number of columns', async () => {
        const gallery = await ABMasonry.create( '#gallery', items, { columns: columns } );
        await gallery.render();

        const columnEls = document.querySelectorAll( '.ab-masonry__column' );
        expect( columnEls.length ).toBe( columns );
    } );

    it( `distributes all ${ items.length } items across columns`, async () => {
        const gallery = await ABMasonry.create( '#gallery', items, { columns } );
        await gallery.render();

        const columnEls = document.querySelectorAll( '.ab-masonry__column' );
        const totalItems = Array.from( columnEls )
                                         .reduce( ( sum, col ) => sum + col.children.length, 0 );

        expect( totalItems ).toBe( items.length );
    } );

    it( 'uses fallback column width if container width is zero', async () => {
        const gallery = await ABMasonry.create( '#gallery', items, { columns } );

        Object.defineProperty( gallery[ 'container' ], 'clientWidth', {
            value: 0,
            configurable: true,
        } );

        const width = gallery[ 'container' ].clientWidth;
        expect( width ).toBe( 0 );
    } );

    it( 'appends columns to the container when render() is called', async () => {
        document.body.innerHTML = '<div><div id="gallery"></div></div>';
        const spy = vi.spyOn( ABMasonryElement, 'create' );
        const gallery = await ABMasonry.create( '#gallery', items, { columns: 2 } );
        await gallery.render();

        expect( spy ).toHaveBeenCalled();
        expect( spy.mock.calls[ 0 ][ 1 ] ).toBe( 1024 / 2 );
    } );
} );
