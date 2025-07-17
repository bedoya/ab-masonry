import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ABMasonryElement } from '@/ABMasonryElement';
import { ABMasonryItem } from '@/types';
import { mockLoadImage } from '/tests/helpers/image-mock';

describe( 'ABMasonryElement', () => {
    const baseItem: ABMasonryItem = { img: '/test.jpg' };

    beforeEach( () => {
        vi.restoreAllMocks();

        vi.stubGlobal( 'Image', function () {
            const img = document.createElement( 'img' );
            Object.defineProperty( img, 'naturalWidth', {
                get: () => 400,
            } );
            Object.defineProperty( img, 'naturalHeight', {
                get: () => 300,
            } );

            setTimeout( () => img.onload?.( new Event( 'load' ) ), 0 );
            return img;
        } as unknown as typeof Image );
    } );

    it( 'creates an instance and sets height', async () => {
        const el = await ABMasonryElement.create( baseItem, 300 );
        expect( el ).toBeInstanceOf( ABMasonryElement );
        expect( el.getHeight() ).toBe( 225 );
        expect( el.getElement() ).toBeInstanceOf( HTMLDivElement );
    } );

    it( 'handles onClick callback', async () => {
        const clickSpy = vi.fn();
        const el = await ABMasonryElement.create( baseItem, 300, clickSpy );
        el.getElement().click();
        expect( clickSpy ).toHaveBeenCalledOnce();
    } );

    it( 'includes caption if provided', async () => {
        const itemWithCaption = { img: '/image.jpg', caption: 'Nice' };
        const el = await ABMasonryElement.create( itemWithCaption, 100 );
        const caption = el.getElement().querySelector( '.ab-masonry__caption' );
        expect( caption ).toBeTruthy();
        expect( caption!.textContent ).toBe( 'Nice' );
    } );

    it( 'uses title as caption if caption missing', async () => {
        const item = { img: '/x.jpg', title: 'Hello' };
        const el = await ABMasonryElement.create( item, 100 );
        const caption = el.getElement().querySelector( '.ab-masonry__caption' );
        expect( caption ).toBeTruthy();
        expect( caption!.textContent ).toBe( 'Hello' );
    } );

    it( 'throws if image URL is invalid', async () => {
        const invalid = { img: 'invalid.jpg' }; // no / or http
        await expect( () => ABMasonryElement.create( invalid, 300 ) ).rejects.toThrow( /Invalid ABMasonryItem/ );
    } );

    it( 'throws if image fails to load', async () => {
        vi.stubGlobal( 'Image', class {
            public src = '';
            public onload!: () => void;
            public onerror!: () => void;

            constructor() {
                setTimeout( () => this.onerror?.(), 1 );
            }
        } );
        await expect( () =>
                          ABMasonryElement.create( { img: '/fail.jpg' }, 300 )
        ).rejects.toThrow( /Image failed to load/ );
    } );

    it( 'scales width proportionally when direction is "w"', () => {
        const size = ABMasonryElement[ 'calculateProportionalSize' ]( 100, 50, 200, 'w' );
        expect( size ).toBe( 400 );
    } );

    it( 'scales height proportionally when direction is "h"', () => {
        const size = ABMasonryElement[ 'calculateProportionalSize' ]( 200, 100, 300, 'h' );
        expect( size ).toBe( 150 );
    } );
} );
