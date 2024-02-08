import { describe, it, expect } from 'vitest';
import { rangeFilter } from './filter.helper';

const minMaxFilterFunction = rangeFilter().headerFilterFunc as (headerValue, rowValue) => boolean;

describe('test minMaxFilterFunction', () => {

    it('should filter min number only', () => {
        const headerValue = '50-';
        expect(minMaxFilterFunction(headerValue, 0)).toBe(false);
        expect(minMaxFilterFunction(headerValue, 50)).toBe(true);
        expect(minMaxFilterFunction(headerValue, '50')).toBe(true);
        expect(minMaxFilterFunction(headerValue, 100)).toBe(true);
        expect(minMaxFilterFunction(headerValue, '100')).toBe(true);
    });

    it('should filter min numbers', () => {
        const headerValue = '50-100';
        expect(minMaxFilterFunction(headerValue, 0)).toBe(false);
        expect(minMaxFilterFunction(headerValue, 50)).toBe(true);
        expect(minMaxFilterFunction(headerValue, '50')).toBe(true);
        expect(minMaxFilterFunction(headerValue, 100)).toBe(true);
        expect(minMaxFilterFunction(headerValue, '100')).toBe(true);
    });

    it('should filter max number only', () => {
        const headerValue = '-50';
        expect(minMaxFilterFunction(headerValue, 0)).toBe(true);
        expect(minMaxFilterFunction(headerValue, 50)).toBe(true);
        expect(minMaxFilterFunction(headerValue, '50')).toBe(true);
        expect(minMaxFilterFunction(headerValue, 100)).toBe(false);
        expect(minMaxFilterFunction(headerValue, '100')).toBe(false);
    });

    it('should filter max numbers', () => {
        const headerValue = '0-50';
        expect(minMaxFilterFunction(headerValue, 0)).toBe(true);
        expect(minMaxFilterFunction(headerValue, 50)).toBe(true);
        expect(minMaxFilterFunction(headerValue, '50')).toBe(true);
        expect(minMaxFilterFunction(headerValue, 100)).toBe(false);
        expect(minMaxFilterFunction(headerValue, '100')).toBe(false);
    });

    it('should filter min max numbers', () => {
        const headerValue = '50-100';
        expect(minMaxFilterFunction(headerValue, 0)).toBe(false);
        expect(minMaxFilterFunction(headerValue, 50)).toBe(true);
        expect(minMaxFilterFunction(headerValue, '50')).toBe(true);
        expect(minMaxFilterFunction(headerValue, 100)).toBe(true);
        expect(minMaxFilterFunction(headerValue, '100')).toBe(true);
    });
});
