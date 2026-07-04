import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import SelectKey from './SelectKey.svelte';

describe('SelectKey', () => {
    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    it.each(keys)('renders the input with the given value', (value: string) => {
        const { getByRole } = render(SelectKey, { value });

        const input = getByRole('textbox') as HTMLInputElement;

        expect(input.value).toBe(value);
    });
});