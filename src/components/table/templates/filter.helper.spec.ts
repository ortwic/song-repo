import { describe, it, expect } from 'vitest';
import { rangeFilter } from './filter.helper';

const minMaxFilterFunction = rangeFilter().headerFilterFunc as (headerValue, rowValue) => boolean;

describe('test minMaxFilterFunction', () => {

    it('should filter min number values', () => {
        const headerValue = { start: 50, end: null };
        expect(minMaxFilterFunction(headerValue, 0)).toBe(false);
        expect(minMaxFilterFunction(headerValue, 50)).toBe(true);
        expect(minMaxFilterFunction(headerValue, '50')).toBe(true);
        expect(minMaxFilterFunction(headerValue, 100)).toBe(true);
        expect(minMaxFilterFunction(headerValue, '100')).toBe(true);
    });

    it('should filter min number strings', () => {
        const headerValue = { start: '50', end: '' };
        expect(minMaxFilterFunction(headerValue, 0)).toBe(false);
        expect(minMaxFilterFunction(headerValue, 50)).toBe(true);
        expect(minMaxFilterFunction(headerValue, '50')).toBe(true);
        expect(minMaxFilterFunction(headerValue, 100)).toBe(true);
        expect(minMaxFilterFunction(headerValue, '100')).toBe(true);
    });

    it('should filter max number values', () => {
        const headerValue = { end: 50 };
        expect(minMaxFilterFunction(headerValue, 0)).toBe(true);
        expect(minMaxFilterFunction(headerValue, 50)).toBe(true);
        expect(minMaxFilterFunction(headerValue, '50')).toBe(true);
        expect(minMaxFilterFunction(headerValue, 100)).toBe(false);
        expect(minMaxFilterFunction(headerValue, '100')).toBe(false);
    });

    it('should filter max number strings', () => {
        const headerValue = { end: '50' };
        expect(minMaxFilterFunction(headerValue, 0)).toBe(true);
        expect(minMaxFilterFunction(headerValue, 50)).toBe(true);
        expect(minMaxFilterFunction(headerValue, '50')).toBe(true);
        expect(minMaxFilterFunction(headerValue, 100)).toBe(false);
        expect(minMaxFilterFunction(headerValue, '100')).toBe(false);
    });

    it('should filter min max number values', () => {
        const headerValue = {
            start: 50,
            end: 100
        };
        expect(minMaxFilterFunction(headerValue, 0)).toBe(false);
        expect(minMaxFilterFunction(headerValue, 50)).toBe(true);
        expect(minMaxFilterFunction(headerValue, '50')).toBe(true);
        expect(minMaxFilterFunction(headerValue, 100)).toBe(true);
        expect(minMaxFilterFunction(headerValue, '100')).toBe(true);
    });

    it('should filter min max number strings', () => {
        const headerValue = {
            start: '50',
            end: '100'
        };
        expect(minMaxFilterFunction(headerValue, 0)).toBe(false);
        expect(minMaxFilterFunction(headerValue, 50)).toBe(true);
        expect(minMaxFilterFunction(headerValue, '50')).toBe(true);
        expect(minMaxFilterFunction(headerValue, 100)).toBe(true);
        expect(minMaxFilterFunction(headerValue, '100')).toBe(true);
    });
});
