import { describe, it, expect } from 'vitest';
import { parseSearchQuery } from './parse-search-query';

describe('parseSearchQuery', () => {
    describe('title only', () => {
        it('returns title when no delimiter is present', () => {
            expect(parseSearchQuery('Bohemian Rhapsody')).toEqual({
                title: 'Bohemian Rhapsody',
            });
        });

        it('trims whitespace from title', () => {
            expect(parseSearchQuery('  Bohemian Rhapsody  ')).toEqual({
                title: 'Bohemian Rhapsody',
            });
        });

        it('handles a single hyphen without spaces (not a delimiter)', () => {
            expect(parseSearchQuery('Spider-Man')).toEqual({
                title: 'Spider-Man',
            });
        });

        it('handles a hyphen at end without surrounding spaces', () => {
            expect(parseSearchQuery('Bohemian Rhapsody-')).toEqual({
                title: 'Bohemian Rhapsody-',
            });
        });
    });

    describe('title and artist', () => {
        it('splits on " - " delimiter', () => {
            expect(parseSearchQuery('Bohemian Rhapsody - Queen')).toEqual({
                title: 'Bohemian Rhapsody',
                artist: 'Queen',
            });
        });

        it('trims whitespace from both parts', () => {
            expect(parseSearchQuery('  Bohemian Rhapsody  -  Queen  ')).toEqual({
                title: 'Bohemian Rhapsody',
                artist: 'Queen',
            });
        });

        it('preserves hyphens in artist name after delimiter', () => {
            expect(parseSearchQuery('Cry Me a River - Justin Timberlake')).toEqual({
                title: 'Cry Me a River',
                artist: 'Justin Timberlake',
            });
        });

        it('preserves hyphens within title before delimiter', () => {
            expect(parseSearchQuery('Spider-Man Theme - Paul Francis Webster')).toEqual({
                title: 'Spider-Man Theme',
                artist: 'Paul Francis Webster',
            });
        });

        it('treats multiple delimiters: only title and artist are extracted', () => {
            expect(parseSearchQuery('Song Title - Artist Name')).toEqual({
                title: 'Song Title',
                artist: 'Artist Name',
            });
        });
    });

    describe('edge cases', () => {
        it('returns empty title for empty string', () => {
            expect(parseSearchQuery('')).toEqual({ title: '' });
        });

        it('returns undefined artist when artist part is empty after delimiter', () => {
            expect(parseSearchQuery('Bohemian Rhapsody -')).toEqual({
                title: 'Bohemian Rhapsody -',
            });
        });

        it('handles delimiter only', () => {
            expect(parseSearchQuery(' - ')).toEqual({ title: '-' });
        });
    });
});