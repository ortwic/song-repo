import { describe, expect, it } from 'vitest';
import { createResourceResolver } from './resource-resolver';

describe('createResourceResolver', () => {
    const resolver = createResourceResolver();

    describe('YouTube URIs', () => {
        it('resolves a standard watch URL to the embed URL', () => {
            const result = resolver.resolve('https://www.youtube.com/watch?v=NF3EDMREv9U');

            expect(result.embedUrl).toEqual('https://www.youtube.com/embed/NF3EDMREv9U');
            expect(result.embedType).toEqual('iframe');
            expect(result.providerId).toEqual('youtube');
        });

        it('resolves a shortened youtu.be URL to the embed URL', () => {
            const result = resolver.resolve('https://youtu.be/q9bltcXjewA');

            expect(result.embedUrl).toBe('https://www.youtube.com/embed/q9bltcXjewA');
            expect(result.embedType).toEqual('iframe');
            expect(result.providerId).toBe('youtube');
        });
    });

    describe('Google Drive URIs', () => {
        it('resolves a /view URL to the /preview embed URL', () => {
            const result = resolver.resolve(
                'https://drive.google.com/file/d/19JUlJ2QPAOt25R4n7gIeAX2qXTDiMEbc/view?usp=drive_link'
            );

            expect(result.embedUrl).toEqual('https://drive.google.com/file/d/19JUlJ2QPAOt25R4n7gIeAX2qXTDiMEbc/preview');
            expect(result.embedType).toEqual('iframe');
            expect(result.providerId).toEqual('google-drive');
        });
    });

    describe('MuseScore URIs', () => {
        it('resolves a /user/{id}/scores/{id} URL by appending /embed', () => {
            const result = resolver.resolve('https://musescore.com/user/27859428/scores/6722249');

            expect(result.embedUrl).toEqual('https://musescore.com/user/27859428/scores/6722249/embed');
            expect(result.embedType).toEqual('iframe');
            expect(result.providerId).toEqual('musescore');
        });

        it('resolves a /{username}/scores/{id} short-form URL by appending /embed', () => {
            const result = resolver.resolve('https://musescore.com/ortwin/scores/5369594');

            expect(result.embedUrl).toBe('https://musescore.com/ortwin/scores/5369594/embed');
            expect(result.providerId).toBe('musescore');
        });
    });

    describe('direct file URIs', () => {
        it('resolves a .png URL to the image embed type without transforming the URL', () => {
            const uri = 'https://s3.amazonaws.com/halleonard-pagepreviews/HL_DDS_1367471kWV5PeK25R.png';
            const result = resolver.resolve(uri);

            expect(result).toEqual({
                embedUrl: uri,
                embedType: 'image',
                providerId: 'image-direct'
            });
        });

        it('resolves a .jpg URL (case-insensitive extension) to the image embed type', () => {
            const uri = 'https://www.alle-noten.de/out/pictures/master/product/1/Art_30033_2.JPG';
            const result = resolver.resolve(uri);

            expect(result.embedType).toBe('image');
            expect(result.providerId).toBe('image-direct');
        });

        it('resolves a .pdf URL to the iframe embed type without transforming the URL', () => {
            const uri = 'https://danjovi.com/wp-content/uploads/2021/04/Ludovico-Einaudi-Expirience-sheet-music.pdf';
            const result = resolver.resolve(uri);

            expect(result).toEqual({
                embedUrl: uri,
                embedType: 'iframe',
                providerId: 'pdf-direct'
            });
        });

        it('resolves a .svg URL to the object embed type', () => {
            const result = resolver.resolve('https://example.com/score.svg');

            expect(result.embedType).toBe('object');
            expect(result.providerId).toBe('svg-direct');
        });
    });

    describe('unknown URIs', () => {
        it('falls back to iframe for an unrecognized hostname and extension', () => {
            const uri = 'https://example.com/some/unknown/resource';
            const result = resolver.resolve(uri);

            expect(result).toEqual({
                embedUrl: uri,
                embedType: 'iframe',
                providerId: 'fallback'
            });
        });

        it('falls back gracefully for a malformed URI instead of throwing', () => {
            const result = resolver.resolve('not-a-valid-url');

            expect(result.embedType).toBe('iframe');
            expect(result.providerId).toBe('fallback');
        });

        it('falls back for an empty string instead of throwing', () => {
            const result = resolver.resolve('');

            expect(result.providerId).toBe('fallback');
        });
    });

    describe('determinism', () => {
        it('returns the same result for the same input across multiple calls', () => {
            const uri = 'https://www.youtube.com/watch?v=NF3EDMREv9U';

            const first = resolver.resolve(uri);
            const second = resolver.resolve(uri);

            expect(first).toEqual(second);
        });
    });
});